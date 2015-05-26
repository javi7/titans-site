/**
  config doc

  topMargin - % of canvas between top & top of backdrop, 1/2 of collapse/expand button, 1/3 of distance from top of canvas to highest camp
  bottomMargin - % of canvas between bottom & lowest camp, 1/2 distance from bottom to top of collapsed backdrop
  sideMargin - % of canvas between left side and first camp, right side and last camp
  buttonWidth - % of canvas width taken up by button
  campInfo - map of camp information
**/

var ContextMap = function(canvasId, config) {
  function testCSS(prop) {
    return prop in document.documentElement.style;
  }
  var cssPrefix = testCSS('MozBoxSizing') ? '-moz-' : testCSS('WebkitTransform') ? '-webkit-' : '';
  var devicePixelRatio = window.devicePixelRatio || 1;
  var context = document.getElementById(canvasId).getContext('2d');
  var backingStoreRatio = context.webkitBackingStorePixelRatio ||
                      context.mozBackingStorePixelRatio ||
                      context.msBackingStorePixelRatio ||
                      context.oBackingStorePixelRatio ||
                      context.backingStorePixelRatio || 1;

  var ratio = devicePixelRatio / backingStoreRatio;

  var climbHeight = config.campInfo[config.campInfo.length - 1].elevation - config.campInfo[0].elevation;
  var climbLength = config.campInfo[config.campInfo.length - 1].panoNumber;
  var lastClick = null;
  var elements = [];
  var campMarkers = [];
  var campLines = [];
  var mountain = null;

  var addElement = function(newElement) {
    elements.push(newElement);
    stage.addChild(newElement);
  };

  // create stage
  var stage = new createjs.Stage(document.getElementById(canvasId));
  stage.enableMouseOver(10);
  stage.canvas.height = canvasHeight = 0.33 * krpano.clientHeight;
  stage.canvas.width = canvasWidth = 0.33 * krpano.clientWidth;
  stage.on('mouseover', function() {
    backdrop.alpha = 0.25;
    mountain.alpha = 0.25;
    stage.update();
  });
  stage.on('mouseout', function() {
    backdrop.alpha = 0.1;
    mountain.alpha = 0.1;
    stage.update();
  });

  // create backdrop
  var backdrop = new createjs.Shape();
  backdrop.graphics.beginFill('white').drawRect(0, 0, canvasWidth, (1 - config.topMargin) * canvasHeight);
  backdrop.originalDimensions = {'width': canvasWidth, 'height':(1 - config.topMargin) * canvasHeight};
  backdrop.y = canvasHeight - backdrop.scaleY * backdrop.originalDimensions.height;
  backdrop.alpha = 0.1;
  backdrop.resize = function(scaleFactor) {
    backdrop.scaleY *= scaleFactor.y;
    backdrop.scaleX *= scaleFactor.x;
    backdrop.y = canvasHeight - backdrop.scaleY * backdrop.originalDimensions.height;
  };
  addElement(backdrop);

  // create toggle button
  var button = new createjs.Container();
  button.on('click', function(event) {
    toggleMap();
    lastClick = new Date().getTime();
  });
  var box = new createjs.Shape();
  box.originalDimensions = {'width': config.buttonWidth * canvasWidth, 'height': 2 * config.topMargin * canvasHeight};
  box.graphics.beginFill('gray').beginStroke('black').drawRect(0, 0, box.originalDimensions.width, box.originalDimensions.height);
  button.addChild(box);
  button.z = 750;
  button.getBox = function() {
    return button.children[0];
  };
  button.drawArrow = function() {
    button.removeChild(button.children[1]);
    var arrow = new createjs.Shape();
    arrow.graphics.beginStroke('black').setStrokeStyle(2);
    if (mapUp) {
      arrow.graphics.moveTo(0.25 * box.originalDimensions.width, 0.25 * box.originalDimensions.height)
      arrow.graphics.lineTo(0.5 * box.originalDimensions.width, 0.75 * box.originalDimensions.height)
      arrow.graphics.lineTo(0.75 * box.originalDimensions.width, 0.25 * box.originalDimensions.height);
    } else {
      arrow.graphics.moveTo(0.25 * box.originalDimensions.width, 0.75 * box.originalDimensions.height)
      arrow.graphics.lineTo(0.5 * box.originalDimensions.width, 0.25 * box.originalDimensions.height)
      arrow.graphics.lineTo(0.75 * box.originalDimensions.width, 0.75 * box.originalDimensions.height);
    }
    button.addChild(arrow);
  };
  button.resize = function(scaleFactor) {
    button.scaleX *= scaleFactor.x;
    button.scaleY *= scaleFactor.y;
    button.regX = button.getBox().originalDimensions.width * button.scaleX / 2;
    button.x = canvasWidth / 2;
    if (mapUp) {
      button.y = 0;
    } else {
      button.y = (1 - 2.5 * config.bottomMargin) * canvasHeight;
    }
    button.drawArrow();
  };
  addElement(button);

  // create current position marker
  var currentPositionMarker = new createjs.Shape();
  currentPositionMarker.graphics.setStrokeStyle(2).beginStroke('black').beginFill('rgba(229,61,0,1)').drawPolyStar(0, 0, 12, 5, 0.6, -90);  
  currentPositionMarker.z = 201;
  currentPositionMarker.on('pressmove', function(event) {
    currentPositionMarker.x = Math.min(event.stageX, campMarkers[campMarkers.length - 1].x);
    currentPositionMarker.x = Math.max(event.target.x, campMarkers[0].x);
    if (mapUp || mapToggling) {
      placePositionMarkerOnSlope();
    } 
    stage.update();
    document.body.style.cursor = cssPrefix + 'grabbing';
    currentPositionMarker.cursor = cssPrefix + 'grabbing';
  });
  currentPositionMarker.cursor = cssPrefix + 'grab';
  currentPositionMarker.on('pressup', function() {
    var skipToPanoNumber = Math.round((currentPositionMarker.x - config.sideMargin * canvasWidth) / ((1 - 2 * config.sideMargin) * canvasWidth) * climbLength);
    krpano.call('loadPanoWrapper(' + skipToPanoNumber + ', false, false);');
    document.body.style.cursor = 'default';
  currentPositionMarker.cursor = cssPrefix + 'grab';
  });
  stage.addChild(currentPositionMarker);

  var logo = new createjs.Shape();
  logo.graphics.f("rgba(229,61,0,254)").p("EB7cBZYMhIqAAAMAAAhBeMBIqAAAMAAABBe").cp().ef().f("rgba(255,255,255,254)").p("EBCuApQIE2AAIAAA8IhkAAIAADmIhkAAIAAjmIhuAAIAAg8").cp().ef().f("rgba(255,255,255,254)").p("EBICApQIDmAAYBGAAAeAeAAAyYAAAogUAUgeAAIAAAAYAUAKAKAUAAAeYAKAyAAAUAKAUIhkAAYgKgUAAgKAAgUYAAgogKgKgeAAIhQAAIAABkIhkAAIAAki").cp().ef().f("rgba(229,61,0,254)").p("EBJmArSIBaAAYAUAAAKgUAAgUYAAgUgKgKgUAAIhaAAIAABG").cp().ef().f("rgba(255,255,255,254)").p("EBPOApQIBuAAICCEiIhuAAIgKgyIiCAAIgUAyIhkAAICCki").cp().ef().f("rgba(229,61,0,254)").p("EBQAAqWIAAAAIgoBuIBQAAIgohu").cp().ef().f("rgba(255,255,255,254)").p("EBTSApQIBaAAIAAEiIhaAAIAAki").cp().ef().f("rgba(255,255,255,254)").p("EBVoApQIBkAAIAADcICqAAIAABGIkOAAIAAki").cp().ef().f("rgba(255,255,255,254)").p("EBbQAt8IDSAAIFyjmIi+DcIHMAAIjwlyIpiF8").cp().ef().f("rgba(255,255,255,254)").p("EBBeAyeIiWEEIAAmaIHCAAIAACWIiWAAIAUUKIigAAIgK0K").cp().ef().f("rgba(255,255,255,254)").p("EBHuAwIICWAAIAAWgIiWAAIAA2g").cp().ef().f("rgba(255,255,255,254)").p("EBN0AyeIiWAAIAAiWIHCAAIAACWIiWAAIAAUKIiWAAIAA0K").cp().ef().f("rgba(255,255,255,254)").p("EBT6AzaYAAh4BkhuB4AAYCCAABkBuAAB4IAATOIiWAAIAAqKIiWAAIAAKKIiWAAIAAzO").cp().ef().f("rgba(229,61,0,254)").p("EBWQA6IICWAAIAAnqIiWAAIAAHq").cp().ef().f("rgba(255,255,255,254)").p("EBdSAwIICMAAYAyEsBQEsAoFAIAKAAYgKh4gKkEAAiCIAAmaICMAAIAAWgIiMAAYgykshQksgolAIAAAAYAAB4AUD6AACCIAAGkIiWAAIAA2g").cp().ef().f("rgba(255,255,255,254)").p("EBmgBAsICWAAIAADmICWAAIAAn0IiWAAYhQAAhGg8AAhaIAAmuYAAh4BkhuCCAAYB4AABkBuAAB4IAACgIiWAAIAAjcIiWAAIAAHqICWAAYBaAAA8BGAABQIAAG4YAAB4hkBkh4AAYiCAAhkhkAAh4IAAiq").cp().ef(); 
  logo.regX = 788;
  logo.regY = 568;
  logo.z = 50;
  logo.scaleX=logo.scaleY=0.15;
  logo.originalDimensions = {'x': 466, 'y': 338}
  logo.resize = function() {
    logo.x = (1 - 2 * config.sideMargin) * canvasWidth;
    logo.y = (1 - 2 * config.bottomMargin) * canvasHeight;
    if (canvasWidth > logo.originalDimensions.x / logo.originalDimensions.y * canvasHeight) {
      logo.scaleY = logo.scaleX = (0.15 * canvasHeight) / logo.originalDimensions.y;
    } else {
      logo.scaleX = logo.scaleY = (0.15 * canvasWidth) / logo.originalDimensions.x;
    }
  };
  addElement(logo);

  // create play button
  // var playImage = new Image();
  // playImage.src = '../images/play-button.gif';
  // var playButton = new createjs.Bitmap(playImage);
  var playButton = new createjs.Shape();
  playButton.graphics.f("rgba(109,110,113,1)").p("EBzKApkcAUKAUKAAAAgqgUAAUAcgUKAUAgggAAAgUKgUKcgUKgUAAAAggqAUAgUAcAUKgUKAggAAKAUKAUA").cp().ef().f("rgba(236,236,236,1)").p("EB7IBOSYAAYYz2T24YAAY4YAAz2z2AA4YYAA4iT2zsYYAAYYYAAT2TsAAYi").cp().ef().f("rgba(109,110,113,1)").p("EBtsAvgYRCRCAAbgxCRCYw4RC7qgKxCxCYw4w4gK7qRCw4YQ4xCbqAARCRC").cp().ef().f("rgba(241,242,242,1)").p("EBp8AyyYPKPAAAYivAPAYvKPA4YAAvKvAYvAvKAA4iPAvAYPAvAYiAAPAPK").cp().ef().f("rgba(236,236,236,1)").p("EBpoAzGYO2O2AAYEu2O2Yu2O24EAAu2u2Yu2u2AA4EO2u2YO2u2YEAAO2O2").cp().ef().f("rgba(241,242,242,0.157480315)").p("EBpoAzGYO2O2AAYEu2O2Yu2O24EAAu2u2Yu2u2AA4EO2u2YO2u2YEAAO2O2").cp().ef().f("rgba(241,242,242,0.2283464567)").p("EBpoAzGYO2O2AAYEu2O2Yu2O24EAAu2u2Yu2u2AA4EO2u2YO2u2YEAAO2O2").cp().ef().f("rgba(168,167,167,1)").p("EBicBNWI9iwaYgKAAgUAAgKAAYgKAKgKAKAAAKMAAAAgqYAAAKAKAKAKAAYAKAKAAAAAKAAYAKAAAAgKAKAAIdiwQYAKgKAAgKAAgKYAAgKAAAAgKgK").cp().ef().f("rgba(2,2,2,1)").p("EBicBNCI86v8YgKAAgKAAgKAAYgUAAgKAKAAAKMAAAAgCYAAAKAKAKAUAAIAKAAYAKAAAKAAAAAAIc6v8YAKgKAAgKAAAAYAAgKAAgKgKgK").cp().ef(); 
  playButton.regX = 200;
  playButton.regY = 200;
  playButton.scaleX = playButton.scaleY = 0.1 * canvasWidth / 500;
  playButton.on('click', function() {
    krpano.call('loadNextPano(true, false);');
    lastClick = new Date().getTime();
    unpause();
  });
  playButton.resize = function(scaleFactor) {
    playButton.x = config.sideMargin * canvasWidth;
    playButton.y = canvasHeight / 2;
    playButton.scaleX = playButton.scaleY *= scaleFactor.x;
  };
  playButton.cursor = 'pointer';
  addElement(playButton);

  var mapUp = true;
  var mapToggling = false;
  var jsPanoNumber = 1;
  var s = null;

  var unpause = function() {
    paused = false;
    playButton.visible = false;
    stage.update();
    document.getElementById('clickToPause').style.display = 'block';
    setTimeout(function() {
      document.getElementById('clickToPause').style.display = 'none';
    }, 2000);
  };

  this.pause = function() {
    playButton.visible = true;
    stage.update();
    paused = true;
  };

  this.unpause = unpause;

  this.initialize = function() {
    initCampMarkers();
    // var g = new createjs.Graphics();
    // g.f("rgba(229,61,0,254)").p("EB7cBZYMhIqAAAMAAAhBeMBIqAAAMAAABBe").cp().ef().f("rgba(255,255,255,254)").p("EBCuApQIE2AAIAAA8IhkAAIAADmIhkAAIAAjmIhuAAIAAg8").cp().ef().f("rgba(255,255,255,254)").p("EBICApQIDmAAYBGAAAeAeAAAyYAAAogUAUgeAAIAAAAYAUAKAKAUAAAeYAKAyAAAUAKAUIhkAAYgKgUAAgKAAgUYAAgogKgKgeAAIhQAAIAABkIhkAAIAAki").cp().ef().f("rgba(229,61,0,254)").p("EBJmArSIBaAAYAUAAAKgUAAgUYAAgUgKgKgUAAIhaAAIAABG").cp().ef().f("rgba(255,255,255,254)").p("EBPOApQIBuAAICCEiIhuAAIgKgyIiCAAIgUAyIhkAAICCki").cp().ef().f("rgba(229,61,0,254)").p("EBQAAqWIAAAAIgoBuIBQAAIgohu").cp().ef().f("rgba(255,255,255,254)").p("EBTSApQIBaAAIAAEiIhaAAIAAki").cp().ef().f("rgba(255,255,255,254)").p("EBVoApQIBkAAIAADcICqAAIAABGIkOAAIAAki").cp().ef().f("rgba(255,255,255,254)").p("EBbQAt8IDSAAIFyjmIi+DcIHMAAIjwlyIpiF8").cp().ef().f("rgba(255,255,255,254)").p("EBBeAyeIiWEEIAAmaIHCAAIAACWIiWAAIAUUKIigAAIgK0K").cp().ef().f("rgba(255,255,255,254)").p("EBHuAwIICWAAIAAWgIiWAAIAA2g").cp().ef().f("rgba(255,255,255,254)").p("EBN0AyeIiWAAIAAiWIHCAAIAACWIiWAAIAAUKIiWAAIAA0K").cp().ef().f("rgba(255,255,255,254)").p("EBT6AzaYAAh4BkhuB4AAYCCAABkBuAAB4IAATOIiWAAIAAqKIiWAAIAAKKIiWAAIAAzO").cp().ef().f("rgba(229,61,0,254)").p("EBWQA6IICWAAIAAnqIiWAAIAAHq").cp().ef().f("rgba(255,255,255,254)").p("EBdSAwIICMAAYAyEsBQEsAoFAIAKAAYgKh4gKkEAAiCIAAmaICMAAIAAWgIiMAAYgykshQksgolAIAAAAYAAB4AUD6AACCIAAGkIiWAAIAA2g").cp().ef().f("rgba(255,255,255,254)").p("EBmgBAsICWAAIAADmICWAAIAAn0IiWAAYhQAAhGg8AAhaIAAmuYAAh4BkhuCCAAYB4AABkBuAAB4IAACgIiWAAIAAjcIiWAAIAAHqICWAAYBaAAA8BGAABQIAAG4YAAB4hkBkh4AAYiCAAhkhkAAh4IAAiq").cp().ef(); 
    // s = new createjs.Shape(g);
    // s.regX = 788;
    // s.regY = 568;
    // s.x = (1 - 2 * config.sideMargin) * canvasWidth;
    // s.y = (1 - config.bottomMargin) * canvasHeight;
    // s.z = 1;
    // s.scaleX=s.scaleY=0.5;
    // s.on('click', function(event) {
    //   alert(event.stageX + ' -- ' + event.stageY);
    // });
    // s.visible = false;
    // var newx = -1000;
    // var newy = -1000;
    // var findMe = setInterval(function() {
    //   if (newx == 1000) {
    //     clearInterval(findMe);
    //     return;
    //   }
    //   if (newy == 1000) {
    //     newx += 100;
    //     newy = -1000;
    //     console.log(newx + ' -- ' + newy);
    //   }
    //   newy += 100;
    //   s.x = newx;
    //   s.y = newy;
    //   stage.update();
    // }, 100);
    // s.z = 2000;
    // stage.addChild(s);
    resize();
    window.addEventListener("resize", resize);
  };

  this.getLastClick = function() {
    return lastClick;
  };

  this.update = function() {
    stage.update();
  };

  var resize = function() {
    var newHeight = 0.33 * krpano.clientHeight * ratio;
    var newWidth = 0.33 * krpano.clientWidth * ratio;
    var scaleFactor = {'y': newHeight / stage.canvas.height, 'x': newWidth / stage.canvas.width};

    stage.canvas.width = canvasWidth = newWidth;
    stage.canvas.height = canvasHeight = newHeight;

    stage.canvas.style.width = newWidth / ratio + 'px';
    stage.canvas.style.height = newHeight / ratio + 'px';

    // now scale the context to counter
    // the fact that we've manually scaled
    // our canvas element
    context.scale(ratio, ratio);

    for (var elementIdx in elements) {
      elements[elementIdx].resize(scaleFactor);
    }
    for (var markerIdx in campMarkers) {
      repositionCampMarker(campMarkers[markerIdx], markerIdx == campMarkers.length - 1);
    }
    drawLines();
    updateCurrentPosition();

    stage.update();
  };

  var initCampMarkers = function() {
    for (var campIdx in config.campInfo) {
      var campMarker = new createjs.Shape();
      campMarker.campInfo = config.campInfo[campIdx];
      if (campIdx == config.campInfo.length - 1) {
        campMarker.mapUpGraphic = new createjs.Graphics();
        campMarker.mapUpGraphic.beginStroke('black').beginFill('darkgray').drawCircle(0, 0, 10);
        campMarker.mapDownGraphic = new createjs.Graphics();
        campMarker.mapDownGraphic.f("rgba(229,61,0,254)").ss(3).s("rgba(0,0,0,254)").p("EAwcBguIHMgKIMgn+ImQH0IPogUIn+sqI1GNS").cp().ef().es(); 
        campMarker.graphics.beginStroke('black').beginFill('darkgray').drawCircle(0, 0, 10);
      } else {
        campMarker.graphics.beginStroke('black').beginFill('darkgray').drawCircle(0, 0, 10);
      }
      repositionCampMarker(campMarker);
      campMarkers.push(campMarker);
      campMarker.z = 200;
      campMarker.cursor = 'pointer';
      campMarker.on('click', function(event, skipToPanoNumber) {
        krpano.call('loadPanoWrapper(' + skipToPanoNumber +', false, false)');
      }, null, false, campMarker.campInfo.panoNumber);

      // create info text for camp marker
      var campText = new createjs.Text(campMarker.campInfo.name + '\n' + campMarker.campInfo.elevation + ' m', '12px Arial', 'white');
      campText.x = campMarker.x;
      campText.y = campMarker.y;
      campText.z = 1001;
      campText.visible = false;
      var campTextOutline = new createjs.Text(campMarker.campInfo.name + '\n' + campMarker.campInfo.elevation + ' m', '12px Arial', 'black');
      campTextOutline.x = campMarker.x;
      campTextOutline.y = campMarker.y;
      campTextOutline.z = 1000;
      campTextOutline.outline = 1;
      campTextOutline.visible = false;
      stage.addChild(campTextOutline);
      stage.addChild(campText);

      // create mouse event handlers for camp marker
      campMarker.on('mouseover', function(event, easelObjects) {
        var textSize = easelObjects.textObj.getMetrics();
        easelObjects.textObj.x = easelObjects.markerObj.x - textSize.width / 2;
        easelObjects.textOutlineObj.x = easelObjects.markerObj.x - textSize.width / 2;
        easelObjects.textObj.y = easelObjects.markerObj.y - 10 - textSize.height;
        easelObjects.textOutlineObj.y = easelObjects.markerObj.y - 10 - textSize.height;
        if (easelObjects.textObj.x < 0) {
          easelObjects.textObj.x = 0;
          easelObjects.textOutlineObj.x = 0;
        }
        if (easelObjects.textObj.x + textSize.width > stage.canvas.width) {
          easelObjects.textObj.x = stage.canvas.width - textSize.width - 1;
          easelObjects.textOutlineObj.x = stage.canvas.width - textSize.width - 1;
        }
        if (easelObjects.textObj.y < 0) {
          easelObjects.textObj.y = 0;
          easelObjects.textOutlineObj.y = 0;
        }
        if (easelObjects.textObj + textSize.height > stage.canvas.height) {
          easelObjects.textObj.y = stage.canvas.height - textSize.height - 1;
          easelObjects.textOutlineObj.y = stage.canvas.height - textSize.height - 1;
        }
        easelObjects.textObj.visible = true;
        easelObjects.textOutlineObj.visible = true;
        stage.update();
      }, null, false, {'textObj': campText, 'textOutlineObj': campTextOutline, 'markerObj': campMarker} );
      campMarker.on('mouseout', function(event, textObjects) {
        textObjects.textObj.visible = false;
        textObjects.textOutlineObj.visible = false;
        stage.update();
      }, null, false, {'textObj': campText, 'textOutlineObj': campTextOutline});
      stage.addChild(campMarker);
    }
  };

  var repositionCampMarker = function(campMarker, summit) {
    campMarker.elevation = (1 - config.bottomMargin) * canvasHeight -  (campMarker.campInfo.elevation - config.campInfo[0].elevation) / climbHeight * (0.85 * canvasHeight);
    if (mapUp) {
      campMarker.y = campMarker.elevation;
    } else {
      campMarker.y = (1 - config.bottomMargin) * canvasHeight;
    }
    campMarker.x = campMarker.campInfo.panoNumber / climbLength * ((1 - 2 * config.sideMargin) * canvasWidth) + config.sideMargin * canvasWidth;
    if (summit && !mapUp) {
      campMarker.scaleX = campMarker.scaleY = 0.25 * canvasWidth / 500;
    } else {
      campMarker.scaleX = campMarker.scaleY = 0.02 * canvasWidth / 10;
    }
  };

  var drawLines = function() {
    for (var lineIdx in campLines) {
      stage.removeChild(campLines[lineIdx]);
    }
    campLines = [];
    var prevCampMarker = null;
    mountain = new createjs.Shape();
    mountain.graphics.setStrokeStyle(0).beginFill('gray');
    for (var markerIdx in campMarkers) {
      var campMarker = campMarkers[markerIdx];
      if (prevCampMarker) {
        var campLine = new createjs.Shape();
        campLine.graphics.setStrokeStyle(3).beginStroke('black').moveTo(prevCampMarker.x, prevCampMarker.y).lineTo(campMarker.x, campMarker.y);
        campLine.z = 50;
        campLines.push(campLine);
        stage.addChild(campLine);
      }
      mountain.graphics.lineTo(campMarker.x, campMarker.y);
      prevCampMarker = campMarker;
    }
    campLines.push(mountain);
    stage.addChild(mountain);
    mountain.graphics.lineTo(prevCampMarker.x, (1 - config.bottomMargin) * canvasHeight).closePath();
    mountain.alpha = 0.5;
    stage.sortChildren(function(a,b) {
      z1 = a.z ? a.z : 5;
      z2 = b.z ? b.z : 5;
      return z1-z2;
    });
  };

  var updateCurrentPosition = function() {
    currentPositionMarker.x = jsPanoNumber / climbLength * (0.9 * canvasWidth) + 0.05 * canvasWidth;
    if (mapUp || mapToggling) {
      placePositionMarkerOnSlope();
    } else {
      currentPositionMarker.y = (1 - config.bottomMargin) * canvasHeight;
    }
    currentPositionMarker.scaleX = currentPositionMarker.scaleY = 0.04 * canvasWidth / 24;
  };

  this.updateCurrentPosition = function(currentPanoNumber) {
    jsPanoNumber = currentPanoNumber;
    updateCurrentPosition();
  };

  var placePositionMarkerOnSlope = function() {
    for (var markerIdx in campMarkers) {
      var campAfterIdx = campMarkers.length - 1;
      if (currentPositionMarker.x < campMarkers[markerIdx].x) {
        campAfterIdx = markerIdx;
        break;
      }
    }
    var markerBefore = campMarkers[campAfterIdx - 1];
    var markerAfter = campMarkers[campAfterIdx ];
    currentPositionMarker.y = (currentPositionMarker.x - markerBefore.x) / (markerAfter.x - markerBefore.x) * (markerAfter.y - markerBefore.y) + markerBefore.y;
  };

  var toggleMap = function() {
    mapUp = !mapUp;

    mapToggling = true;
    var toggleStep = 0;
    button.visible = false;
    var summitMarker = campMarkers[campMarkers.length - 1];
    if (mapUp) {
      summitMarker.graphics = summitMarker.mapUpGraphic;
      summitMarker.regX = summitMarker.regY = 0;
      summitMarker.scaleX = summitMarker.scaleY = 0.02 * canvasWidth / 10;
    }
    var boxHeight = backdrop.scaleY * backdrop.originalDimensions.height;
    var toggleMapAnimation = setInterval(function() {
      if (toggleStep == 10) {
        mapToggling = false;
        button.resize({'x': 1, 'y': 1});
        clearInterval(toggleMapAnimation);
        if (mapUp) {
          logo.visible = true;
        } else {
          summitMarker.graphics = summitMarker.mapDownGraphic;
          summitMarker.scaleX = summitMarker.scaleY = 0.25 * canvasWidth / 500;
          summitMarker.regX = 414;
          summitMarker.regY = 578;
          logo.visible = false;
        }
        button.visible = true;
        stage.update();
      } else {
        toggleStep++;
        for (var markerIdx in campMarkers) {
          var campMarker = campMarkers[markerIdx];
          var campStep = (campMarker.elevation - ((1 - config.bottomMargin) * canvasHeight)) / 10;
          if (mapUp) {
            campMarker.y += campStep;
          } else {
            campMarker.y -= campStep;
          }
        }
        var boxStep = ((1 - config.topMargin) - 2 * config.bottomMargin) * canvasHeight / 10;
        if (mapUp) {
          boxHeight += boxStep;
        } else {
          boxHeight -= boxStep;
        }
        backdrop.y = canvasHeight - boxHeight;
        backdrop.scaleY = boxHeight / backdrop.originalDimensions.height;
        drawLines();
        updateCurrentPosition();
        stage.update();
      }
    }, 30);
  };
};


