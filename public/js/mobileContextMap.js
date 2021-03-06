var MobileContextMap = function(canvasId, mtnInfo) {
  var initialize = function() { 
    createBackdrop(stage, mtnInfo);
    createMarkers(stage, mtnInfo);
    currentPositionMarker = createCurrentPositionMarker(stage, mtnInfo);
    stage.update(); 
  }

  var stage = createStage(canvasId);
  var currentPositionMarker = null;
  initialize();

  this.updateCurrentPosition = function(panoNumber) {
    var lastPanoNumber = mtnInfo[mtnInfo.length - 1].panoNumber;
    currentPositionMarker.y = ((lastPanoNumber - 1) - (panoNumber - 1)) / (lastPanoNumber - 1) * (stage.canvas.height - 35 - 35) + 35;
    stage.update();
  }

  var reset = function() {
    stage.removeAllChildren();
    stage.canvas.height = 0.6 * krpano.clientHeight;
    initialize();
  }

  window.addEventListener('resize', reset);
}

var createStage = function(canvasId) {
  var newStage = new createjs.Stage(document.getElementById(canvasId));
  newStage.enableMouseOver(10);
  newStage.canvas.height = 0.6 * krpano.clientHeight;
  newStage.canvas.width = 45;
  return newStage;
} 

var createBackdrop = function(stage, mtnInfo) {
  var newBackdrop = new createjs.Shape();
  newBackdrop.graphics.beginFill('rgba(37,37,37,1)').drawRect(0, 0, stage.canvas.width, stage.canvas.height);
  newBackdrop.alpha = 0.5;
  newBackdrop.on('click', skipToClick, null, false, {'stage': stage, 'mtnInfo': mtnInfo});
  stage.addChild(newBackdrop);
}

var createMarkers = function(stage, mtnInfo) {
  var baseMarker = new createjs.Shape();
  baseMarker.graphics.beginStroke('black').ss(3).beginFill('darkgray').drawCircle(0, 0, 18);
  baseMarker.x = stage.canvas.width / 2;
  baseMarker.y = stage.canvas.height - 35;
  baseMarker.on('click', function(event) {
    var skipCacheBuster = '';
    if (typeof cacheBusters !== 'undefined' && 'img' in cacheBusters && 1 in cacheBusters['img']) {
      skipCacheBuster = cacheBusters['img'][1];
    }
    krpano.call('loadPanoWrapper(' + 1 + ', false, false,' + skipCacheBuster + ')');
  }, null, false);

  var midCampMarker = null;
  for (var campIdx in mtnInfo) {
    if ('midCamp' in mtnInfo[campIdx] && mtnInfo[campIdx].midCamp === true) {
      midCampMarker = new createjs.Shape();
      midCampMarker.graphics.beginStroke('black').ss(3).beginFill('darkgray').drawCircle(0, 0, 18);
      midCampMarker.x = stage.canvas.width / 2;
      var lastPanoNumber = mtnInfo[mtnInfo.length - 1].panoNumber;
      midCampMarker.y = ((lastPanoNumber - 1) - (mtnInfo[campIdx].panoNumber - 1)) / (lastPanoNumber - 1) * (stage.canvas.height - 35 - 35) + 35;
      midCampMarker.on('click', function(event, skipToPanoNumber) {
        var skipCacheBuster = '';
        if (typeof cacheBusters !== 'undefined' && 'img' in cacheBusters && skipToPanoNumber in cacheBusters['img']) {
          skipCacheBuster = cacheBusters['img'][skipToPanoNumber];
        }
        krpano.call('loadPanoWrapper(' + skipToPanoNumber + ', false, false,' + skipCacheBuster + ')');
      }, null, false, mtnInfo[campIdx].panoNumber);
    } 
  }
  

  var summitMarker = new createjs.Shape();
  summitMarker.graphics.beginStroke('black').ss(3).beginFill('darkgray').drawCircle(0, 0, 18);
  summitMarker.x = stage.canvas.width / 2;
  summitMarker.y = 35;
  summitMarker.on('click', function(event, skipToPanoNumber) {
    var skipCacheBuster = '';
    if (typeof cacheBusters !== 'undefined' && 'img' in cacheBusters && skipToPanoNumber in cacheBusters['img']) {
      skipCacheBuster = cacheBusters['img'][skipToPanoNumber];
    }
    krpano.call('loadPanoWrapper(' + skipToPanoNumber + ', false, false,' + skipCacheBuster + ')');
  }, null, false, mtnInfo[mtnInfo.length - 1].panoNumber);

  var line = new createjs.Shape();
  line.graphics.beginStroke('black').ss(3).moveTo(baseMarker.x, baseMarker.y).lineTo(summitMarker.x, summitMarker.y);
  line.on('click', skipToClick, null, false, {'stage': stage, 'mtnInfo': mtnInfo});

  stage.addChild(line);
  stage.addChild(baseMarker);
  if (midCampMarker !== null) {
    stage.addChild(midCampMarker);
  }
  stage.addChild(summitMarker);
}

var createCurrentPositionMarker = function(stage, mtnInfo) {
  currentPositionMarker = new createjs.Shape();
  currentPositionMarker.graphics.f('#dc6026').s('black').ss(3).drawCircle(0, 0, 12);
  currentPositionMarker.x = stage.canvas.width / 2;
  currentPositionMarker.y = stage.canvas.height - 35;
  stage.addChild(currentPositionMarker);
  return currentPositionMarker;
}

var skipToClick = function(event, blob) {
  if (event.stageY > 35 && event.stageY < (blob.stage.canvas.height - 35)) {
    var lastPanoNumber = blob.mtnInfo[blob.mtnInfo.length - 1].panoNumber;
    var skipToPanoNumber = Math.round(((blob.stage.canvas.height - 70) - (event.stageY - 35)) / (blob.stage.canvas.height - 70) * (lastPanoNumber - 1) + 1);
    var skipCacheBuster = '';
    if (typeof cacheBusters !== 'undefined' && 'img' in cacheBusters && skipToPanoNumber in cacheBusters['img']) {
      skipCacheBuster = cacheBusters['img'][skipToPanoNumber];
    }
    krpano.call('loadPanoWrapper(' + skipToPanoNumber + ', false, false,' + skipCacheBuster + ')');
  }
}