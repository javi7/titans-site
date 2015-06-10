var krpano = null;
var panoDiv = null;

var contextMap = null;

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
initClimbMode = function(mountainName) {
  krpano = document.getElementById("krpanoSWFObject");
  panoDiv = document.getElementById("pano");
  var initialPanoNumber = getQueryVariable() ? getQueryVariable() : 1;
  krpano.call('set(panoNumber,' + initialPanoNumber + ');');
  krpano.call('setupDemoMode();');
  krpano.call('set(mountain, ' + mountainName + ');');
  krpano.call('set(lastPano, ' + campInfo[campInfo.length - 1].panoNumber + ');');
  var mobileView = krpano.clientWidth < 768;
  krpano.call('set(mobileView, ' + mobileView + ');');
  krpano.call('pause(true)');

  paused = true;

  var pauseOnSpace = function(event) {
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
  
  contextMap = new ContextMap('contextMap', {'topMargin': 0.025, 'bottomMargin': 0.05, 'sideMargin': 0.1, 'buttonWidth': 0.1, 'campInfo': campInfo});
  contextMap.initialize();
};

setCampVariables = function(panoNumber) {
  var prevCamp = 0;
  var nextCamp = 0;
  var jsPanoNumber = parseInt(panoNumber);
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

  contextMap.updateCurrentPosition(jsPanoNumber);
  contextMap.update();
};

