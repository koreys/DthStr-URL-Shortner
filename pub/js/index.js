"use strict";
//thomas fuchs tweet sized template script
function template(str,d){
 for(var p in d)
   str=str.replace(new RegExp('{'+p+'}','g'), d[p]);
 return str;
}

//template for returned urls
let shrtTemp = `
<div id="replacementDiv">
  <h2 class="centerWhenSmall">This is the url the emperor has forseen:</h2>
  <h1 class="whiteBorder">{shortUrl}</h1>
  <h2 class="centerWhenSmall">Search you feelings...You know it to be true!</h2>
  <button class='btn btn-default' id='trackingLnk'>Want to track this url's usage?</button>
</div>`

//template for returned statistics
let statsTemp = `
<div id="replacementStatsDiv" class="col-lg-12">
  <img src="/img/phasma.png" id="phasma" alt="">
  <h2 class="centerWhenSmall">The empire has been watching closely!</h2>
  <h1>The URL '{shortUrl}' has been used {clickNumber} times.</h1>
  <h2 class="centerWhenSmall">Captain Phasma's detailed analysis shows the folowing:</h2>
</div>
<div class="clearfix"></div>`

//click function for the useForceBtn
$('#useForceBtn').click(function(e){
  e.preventDefault();
  console.log("useForceBtn clicked.")
  let longUrl = $('#orig-url').val();

  //check to see if user included http or https in the url... if so do nothing. If not add http:// the the front of thier submitted url.
  let protocolStr = $('#orig-url').val().substring(0,4);
  if(protocolStr != 'http'){
    longUrl = `http://${longUrl}`;
    console.log(`Note: Submitted string did not include protocol. http:// was added to string.`);
  }

  let urlData = { longUrl : longUrl };
  $.post('/api/short', urlData)
    .done(function(result){
      console.log(result);

      let urlDivReplacement = template(shrtTemp, { shortUrl : result.shortUrl });

      console.log(urlDivReplacement);

      $('#deathStar').prop('src', '/img/palpatine.png');
      $('#deathStar').addClass('animated fadeIn');
      $('#urlDiv').html(urlDivReplacement);
      $('#urlDiv').addClass('animated zoomIn');
      //add smooth scroll function to tracking link...
      $('#trackingLnk').click(function(){
        $('html, body').animate({
          scrollTop: $('#tipsAnchor').offset().top
        }, 1000);
      })
    })
});

//statsSubmitBtn click function
$('#statsSubmitBtn').click(function(e){
  e.preventDefault();
  console.log('statsSubmitBtn pressed');

  //check to see if user included http or in the url...If not add http:// the the front of thier submitted url.
  let protocolStr = $('#urlStatsTxt').val().substring(0,4);
  console.log(`protocol string is: ${protocolStr}`);

  let urlStats = '';

  if(protocolStr.trim() === 'http'){
    console.log(`NOTE: protocolStr is equal to http... set urlStats to ${$('#urlStatsTxt').val()}`);
    urlStats = $('#urlStatsTxt').val();
  } else {
    urlStats = `http://${$('#urlStatsTxt').val()}`;
    console.log(`Note: Submitted string did not include protocol. http:// was added to string.`);
  }

  let urlStatsObj = { urlStats : urlStats };

  $.post('/api/stats', urlStatsObj)
    .done(function(results){
    console.log(`post to /api/stats occured. Result data is: ${JSON.stringify(results)}`);

    let statsDivReplacement = template(statsTemp, { shortUrl : urlStats, clickNumber : results.statsData.clicks });

    let statsConsole = `<div id="ipStatsDiv">
                          <div class="heading">
                            <i class="fa fa-circle pull-left" style="color:#A16;"></i>
                            <i class="fa fa-circle pull-left" style="color:#EB1;"></i>
                            HoloNet Term
                          </div>
                          <div class="termBody">
                          Current Time: ${moment()}<br/>
                          phasma@dthstr:~$&nbsp;grep ${results.statsData.shortUrl} *.<br/>
                          Search Results:<br/>`
    results.statsData.stats.forEach(function(item,index){
      let ipStat = `<span class="ipStat">${index} | IpAddr: ${item.ip} | time: ${moment.unix(item.clickTime)} (${moment.unix(item.clickTime).fromNow()})</span><br/>`
      statsConsole += ipStat;
    });
    statsConsole += 'phasma@dthstr:~<span class="cursor">&#9646;</span></div></div>';
    statsDivReplacement += statsConsole;

    $('#statsDiv').html(statsDivReplacement);
    $('#statsDiv').addClass('animated zoomIn');


    });

});

//smooth scroll function - Thanks to css-tricks.com
$(function() {
  $('a[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });
});

//Social Media Share Icons
$("#share").jsSocials({
            shareIn: "popup",
            css: "socialFont",
            shares: ["twitter", "facebook"]
        });
