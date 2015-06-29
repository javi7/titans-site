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

var resize = function() {
  mobileContextMap = new MobileContextMap
}

var initializeXmlVars = function() {
  var initialPanoNumber = getQueryVariable() ? getQueryVariable() : 1;
  krpano.call('set(climbing, false);');
  krpano.call('set(ascending, false);');
  krpano.call('set(descending, false);');
  krpano.call('set(mountain, ' + mountainName + ');');
  krpano.call('set(lastPano, ' + campInfo[campInfo.length - 1].panoNumber + ');');
  if (initialPanoNumber != 1) {
    krpano.call('loadPanoWrapper(' + initialPanoNumber + ',false,false);');
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
