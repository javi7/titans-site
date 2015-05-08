$(document).ready( function(){

  var peak = function(name, origin, stage) {
    var g = new createjs.Graphics().setStrokeStyle(1).beginStroke('black').beginFill('orange');
    g.moveTo(0, 0).lineTo(10, -20).lineTo(20, 0).closePath();
    var peakShape = new createjs.Shape(g);
    var peakLabel = new createjs.Text('Aconcagua');
    peakShape.on('mouseover', function(event) {
      peakLabel.x = peakShape.x;
      peakLabel.y = peakShape.y;
      stage.addChild(peakLabel);
      stage.update();
      document.body.style.cursor='pointer';
    });
    peakShape.on('mouseout', function(event) {
      stage.removeChild(peakLabel);
      stage.update();
      document.body.style.cursor='default';
    });
    peakShape.on('click', function(event) {
      alert('climbing time!!!');
    });
    stage.addChild(peakShape);

    this.update = function() {
      peakShape.x = (origin.x - leftEdge)/ mapWidth * scaledWidth;
      peakShape.y = (origin.y - topEdge) / mapHeight * scaledHeight;
      peakShape.scaleX = 0.5 * (scaledWidth / mapWidth);
      peakShape.scaleY = 0.5 * (scaledHeight / mapHeight);
    }
  };

  var mapWidth = 1357;
  var mapHeight = 628;
  var zoomFactor = 1;
  var leftEdge = 0;
  var rightEdge = mapWidth;
  var topEdge = 0;
  var bottomEdge = mapHeight;
  var xOffset = 0;
  var yOffset = 0;
  var scaledWidth = mapWidth;
  var scaledHeigt = mapHeight;
  var zoomPoint = null;
  var prevMouse = null;

  var c = $('#mapCanvas');

  var stage = new createjs.Stage('mapCanvas');
  stage.enableMouseOver(10);
  stage.on('dblclick', function(event) {
    zoomPoint = {'x': event.stageX / map.scaleX + leftEdge, 'y': event.stageY / map.scaleY + topEdge};
    zoomFactor += 1;
    stage.update();
  });
  stage.on('pressmove', function(event) {
    if (!prevMouse) {
      prevMouse = {'x': event.stageX, 'y': event.stageY};
    } else {
      map.x += event.stageX - prevMouse.x;
      map.y += event.stageY - prevMouse.y;
      stage.update();
      prevMouse.x = event.stageX;
      prevMouse.y = event.stageY;
    }
  });
  stage.on('pressup', function(event) {
    prevMouse = null;
  });
  var map = new createjs.Bitmap('/images/map.png');
  map.on('tick', function() {
    if (stage.canvas.width > stage.canvas.height * mapWidth/mapHeight) {
      map.scaleX = stage.canvas.width / mapWidth;
      map.scaleY = map.scaleX;
    } else {
      map.scaleY = stage.canvas.height / mapHeight;
      map.scaleX = map.scaleY;
    }
    map.scaleX *= zoomFactor;
    map.scaleY *= zoomFactor;
    scaledWidth = mapWidth * map.scaleX;
    scaledHeight = mapHeight * map.scaleY;
    if (zoomPoint) {
      var scaledZoom = {};
      scaledZoom.x = map.scaleX * zoomPoint.x;
      scaledZoom.y = map.scaleY * zoomPoint.y;
      map.x = stage.canvas.width / 2 - scaledZoom.x;
      map.y = stage.canvas.height / 2 - scaledZoom.y;
    }
    leftEdge = map.x * -1 / map.scaleX;
    topEdge = map.y * -1 / map.scaleY;
    peaks.map(function(peak) {
      peak.update();
    });
    zoomPoint = null;
  });
  
  stage.addChild(map);

  var peaks = [new peak('aconcagua', {x: 400, y: 500}, stage)];

  $(window).resize(respondCanvas);

  function respondCanvas(){ 
    stage.canvas.width = $(window).width();
    stage.canvas.height = $(window).height() - 30;
    stage.update();
  }

  respondCanvas();
}); 