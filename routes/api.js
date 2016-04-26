"use strict";
var bodyParser = require('body-parser');
var colors = require('colors');
var Datastore = require('nedb');
var db = new Datastore({ filename: 'database/urlDbase.db', autoload: true });
let moment = require('moment');
const nodemailer = require('nodemailer');

var jsonParser = bodyParser.json();
var urlEncodeParser = bodyParser.urlencoded({ extended:false });

module.exports = function(app){


  //Create a short URL
  app.post('/api/short', urlEncodeParser, function(req, res){
    let longUrl = req.body.longUrl;

    //Create a unique 4 digit hash
    let makeHash = function(){
      return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);
    }

    let shortUrl = `http://dthstr.co/${makeHash()}`;

    //define database doc
    let doc = {
      longUrl : longUrl,
      shortUrl : shortUrl,
      stats: [],
      clicks: 0
    };

    //insert database doc
    db.insert(doc, function(err, newDoc){
      console.log(`Successfully inserted doc into dbase. The id of the new doc is: ${newDoc._id}`.yellow);
    });

    console.log(`/api/short called. LongUrl is: ${longUrl} and new shortHash is: ${shortUrl}`.blue);
    res.json({ shortUrl : shortUrl });
    
    //send me a txt message so I know!
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'korey@twininc.com', // Your email id
            pass: 'phbtxrxtpjownmxr' // Your password
        }
    });
    
    let textMsg = `A new shortURL was created! ShortURL is: ${shortUrl}`;
    
    var mailOptions = {
        from: 'korey@twininc.com>', // sender address
        to: '7322671518@att.com', // list of receivers
        subject: 'New Short URL', // Subject line
        text: textMsg //, // plaintext body
        // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            //res.json({yo: 'error'});
        }else{
            console.log('Message sent: ' + info.response);
            //res.json({yo: info.response});
        };
    });


  }); // -- End Create a short URL

  //Lookup stats on a given shortURL
  app.post('/api/stats', urlEncodeParser, function(req, res){
    let shortUrl = req.body.urlStats;
    console.log(JSON.stringify(req.body) .white);
    console.log(`POST to /api/stats occured. Sent url for lookup is: ${shortUrl}`);
    //find record in database
    db.findOne({ shortUrl : shortUrl }, function (err, doc) {
      if(err){
        console.log(`lookup failed, Cannot find stats on shortURL provided.`.red);
        res.json({ status : 'failed'});
      } else{
        console.log(`lookup success, Sending stats on shortURL provided.`.green.bold);
        console.log(`found Data: ${JSON.stringify(doc)}`);
        res.json({ status : 'ok', statsData : doc });
      }
    });

  }); // -- End Stats Lookup
  
  //Admin call pages to List,CRUD All Urls
  app.get('/api/admin/list', function(req, res){
     //grab the last 20 url records and return
     db.find({},function(err, docs){
         res.send(JSON.stringify(docs));
     }); 
  });

  //the actual redirect code
  app.get('/([A-Z, a-z, 0-9, #@$%]{4})', function(req, res){
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let shortUrl = `http://dthstr.co${req.originalUrl}`;
    let clickTime = moment().unix();

    console.log(`IP address of request was: ${ip}`.bgCyan);
    console.log(`/Recieved GET: ${req.originalUrl}...at time: ${clickTime}...Atempting redirect to lookup the redirct URL...`.blue.bold);

    //look up /xxxx in dbase and retrieve long url
    db.find({ shortUrl: shortUrl }, function (err, docs) {
      if(docs.length = 1){
        let longUrl = docs[0].longUrl;
        console.log(`Redirect URL found...Requester will be sent to: ${longUrl}`.blue);
        //respond with redirect to long url
        res.redirect(longUrl);
        console.log(`redirect completed.`.black.bgWhite);

        //log redirect to database with ip address of caller
        db.update({ shortUrl: shortUrl },{ $push: { stats: { ip : ip, clickTime : clickTime } }, $inc: {clicks: 1} }, {}, function(){
          console.log(`Logging of redirect completed.`.yellow);
        });

      } else {
        console.log('Something went wrong... long url cant be found.'.red);
        //Send and error page at this point
        res.send('<h4>Sorry but the short Url code not be found for redirection.</h4>')
      }
    }); // -- End Redirect Code


  })

}
