var copyToClipboard = function(imageNumber, hlookat, vlookat) {
  var text = hlookat.toString() + "\t" + vlookat.toString() + "\t";
  window.prompt("horiz -- vertical\nImage # " + imageNumber.toString(), text);
};

var copyCursorPos = function(x, y, imageNumber) {
  var text = x.toString() + "\t" + y.toString();
  window.prompt("horiz -- vertical\nImage # " + imageNumber.toString(), text);
};

var captureW = function(event) {
  var keycode = event.keyCode;
  if (keycode == 87) {
    krpano.call('getOrientation();');
  }
};

document.addEventListener("keydown", captureW, false);