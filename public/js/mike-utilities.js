var copyToClipboard = function(imageNumber, hlookat, vlookat, fov) {
  var text = hlookat.toString() + "\t" + vlookat.toString() + "\t" + fov.toString() + "\t";
  window.prompt("horiz -- vertical -- fov\nImage # " + imageNumber.toString(), text);
};

var copyCursorPos = function(x, y, imageNumber) {
  var text = x.toString() + "\t" + y.toString();
  window.prompt("horiz -- vertical\nImage # " + imageNumber.toString(), text);
};

var getMousePos = function(event) {
  var keycode = event.keyCode;
  if (keycode == 32) {
    krpano.call('getMousePosition();');
  }
};
document.addEventListener("keydown", getMousePos, false);