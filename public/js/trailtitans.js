var krpano = null;
var panoDiv = null;

var contextMap = null;
var mobileContextMap = null;
var initialized = false;
var mountainName = null;

function getQueryVariable() {
  var variable = 'startAt';
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return null;
}
var pause = function(event) { 
  krpano.call('breakall()');
  if (!contextMap.getLastClick() || new Date().getTime() - contextMap.getLastClick() > 10) {
    krpano.call('pause(false);');
    contextMap.pause();
  }
};

var initClimbMode = function(mtnName) {
  mountainName = mtnName;
  krpano = document.getElementById("krpanoSWFObject");
  panoDiv = document.getElementById("pano");
  paused = true;

  var pauseOnSpace = function(event) {
    krpano.call('breakall()');
    var keycode = event.keyCode;
    if (keycode == 32) {
      paused = !paused;
      if (paused) {
        contextMap.pause();
      } else {
        contextMap.unpause();
      }
    }
  };
  document.ontouchstart = pause;
  document.onclick = pause;
  document.addEventListener("keydown", pauseOnSpace, false);
  
  contextMap = new ContextMap('contextMap', {'topMargin': 0.025, 'bottomMargin': 0.05, 'sideMargin': 0.1, 'buttonWidth': 0.1, 'campInfo': campInfo}, mountainName);
  contextMap.initialize();

  mobileContextMap = new MobileContextMap('mobile-context-map', campInfo);
};

var initializeXmlVars = function() {
  var initialPanoNumber = getQueryVariable() ? getQueryVariable() : 1;
  krpano.call('set(climbing, false);');
  krpano.call('set(ascending, false);');
  krpano.call('set(descending, false);');
  krpano.call('set(mountain, ' + mountainName + ');');
  krpano.call('set(lastPano, ' + campInfo[campInfo.length - 1].panoNumber + ');');
  if (initialPanoNumber != 1) {
    krpano.call('loadPanoWrapper(' + initialPanoNumber + ',false,false);');
    document.getElementById('infoBox').style.display='none';
    return false;
  }
  return true;
};

var setCampVariables = function(panoNumber) {
  if (!initialized) {
    initialized = true;
    if (!initializeXmlVars()) {
      return false;
    }
  }

  var mobileView = krpano.clientWidth < 768;
  krpano.call('set(mobileView, ' + mobileView + ');');
  var prevCamp = 0;
  var nextCamp = 0;
  var jsPanoNumber = parseInt(panoNumber);
  
  // add special case spring video to halfdome pic 46
  if (mountainName === 'halfdome' && jsPanoNumber === 46) {
    krpano.call("addhotspot(spring_video_play_button);set(hotspot[spring_video_play_button].url, 'http://d39rd677qckrt3.cloudfront.net/images/play7.png');set(hotspot[spring_video_play_button].ath, -182);set(hotspot[spring_video_play_button].atv, 15);set(hotspot[spring_video_play_button].onclick, js(playVideo();));");
  }

  for (var i = 0; i < campInfo.length; i++) {
    prevCamp = nextCamp;
    nextCamp = campInfo[i].panoNumber;
    if (nextCamp > panoNumber) {
      break;
    }
  };

  krpano.call('set(nextCamp,' + nextCamp + ');');
  krpano.call('set(prevCamp,' + prevCamp + ');');
  var imgCacheBuster = '';
  var nextImgCacheBuster = '';
  var prevImgCacheBuster = '';
  if (typeof cacheBusters !== 'undefined') {
    if ('img' in cacheBusters) {
      if (jsPanoNumber in cacheBusters['img']) {
        imgCacheBuster = cacheBusters['img'][jsPanoNumber];
      }
      if ((jsPanoNumber + 1) in cacheBusters['img']) {
        nextImgCacheBuster = cacheBusters['img'][jsPanoNumber + 1];
      }
      if ((jsPanoNumber - 1) in cacheBusters['img']) {
        prevImgCacheBuster = cacheBusters['img'][jsPanoNumber - 1];
      }
    }
  }
  krpano.call('set(imgCacheBuster,' + imgCacheBuster + ');');
  krpano.call('set(nextImgCacheBuster,' + nextImgCacheBuster + ');');
  krpano.call('set(prevImgCacheBuster,' + prevImgCacheBuster + ');');
  krpano.call('preloadWrapper()');

  krpano.call('finishInitializingVars();');

  contextMap.updateCurrentPosition(jsPanoNumber);
  contextMap.update();

  mobileContextMap.updateCurrentPosition(jsPanoNumber);
};

var closeInfoBox = function(event) {
  document.getElementById('infoBox').style.display = 'none';
  var evt = event ? event:window.event;
  if (evt.stopPropagation)    evt.stopPropagation();
  if (evt.cancelBubble!=null) evt.cancelBubble = true;
}

var playVideo = function() {
  var clientHeight = krpano.clientHeight;
  var clientWidth = krpano.clientWidth;
  var width = 1920;
  var height = 1080;
  if (clientWidth / clientHeight < 1920 / 1080) {
    height = height * clientWidth / width;
    width = clientWidth;
  } else {
    width = width * clientHeight / height;
    height = clientHeight;
  }

  krpano.call("addlayer(video_stage);set(layer[video_stage].type, container);set(layer[video_stage].align, center);set(layer[video_stage].width, " + width + ");set(layer[video_stage].height, " + height + ");addlayer(spring_video);set(layer[spring_video].parent, video_stage);set(layer[spring_video].align, center);set(layer[spring_video].videourl, 'http://d39rd677qckrt3.cloudfront.net/videos/spring.mp4');set(layer[spring_video].url, 'http://d39rd677qckrt3.cloudfront.net/videoplayer.js');set(layer[spring_video].handcursor, false);set(layer[spring_video].pausedonstart, false);set(layer[spring_video].width, " + width + ");set(layer[spring_video].height, " + height + ");set(layer[spring_video].loop, true);set(layer[spring_video].ath, -182);set(layer[spring_video].atv, 30);set(layer[spring_video].onclick, togglepause());set(layer[spring_video].onvideoready, addlayer(close_video_button);set(layer[close_video_button].parent, video_stage);set(layer[close_video_button].align, righttop);set(layer[close_video_button].url, 'http://d39rd677qckrt3.cloudfront.net/images/close2.png');set(layer[close_video_button].y, 30);set(layer[close_video_button].x, 30);set(layer[close_video_button].onclick, js('closeVideo();'));)");

  document.getElementById('contextMap').style.display = 'none';
}

var closeVideo = function() {
  document.getElementById('contextMap').style.display = 'block';
  krpano.call("removelayer(spring_video);removelayer(close_video_button);");
}