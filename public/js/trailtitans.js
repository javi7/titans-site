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

initClimbMode = function() {
  krpano = document.getElementById("krpanoSWFObject");
  panoDiv = document.getElementById("pano");
  var initialPanoNumber = getQueryVariable() ? getQueryVariable() : 1;
  krpano.call('set(panoNumber,' + initialPanoNumber + ');');
  krpano.call('setupDemoMode();');
  krpano.call('pause(true);');
  krpano.call('set(lastPano, ' + campInfo[campInfo.length - 1].panoNumber + ');');
  paused = true;
  
  var pause =  function(event) { 
    if (!contextMap.getLastClick() || new Date().getTime() - contextMap.getLastClick() > 10) {
      krpano.call('pause(false);');
      contextMap.pause();
    }
  };

  var pauseOnSpace = function(event) {
    var keycode = event.keyCode;
    if (keycode == 32) {
      krpano.call('spacebar();');
      paused = !paused;
      if (paused) {
        contextMap.pause();
      } else {
        contextMap.unpause();
      }
    }
  };
  panoDiv.ontouchstart = pause;
  panoDiv.onclick = pause;
  document.addEventListener("keydown", pauseOnSpace, false);
  
  contextMap = new ContextMap('contextMap', {'topMargin': 0.025, 'bottomMargin': 0.05, 'sideMargin': 0.05, 'buttonWidth': 0.1, 'campInfo': campInfo});
  contextMap.initialize();
};

setCampVariables = function(panoNumber) {
  var prevCamp = 0;
  var nextCamp = 0;
  jsPanoNumber = panoNumber;
  for (var i = 0; i < campInfo.length; i++) {
    prevCamp = nextCamp;
    nextCamp = campInfo[i].panoNumber;
    if (nextCamp > panoNumber) {
      break;
    }
  };
  krpano.call('set(nextCamp,' + nextCamp + ');');
  krpano.call('set(prevCamp,' + prevCamp + ');');

  contextMap.updateCurrentPosition(jsPanoNumber);
  contextMap.update();
};


