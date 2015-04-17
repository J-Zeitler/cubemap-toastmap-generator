'use strict';

var Zipper = {};

Zipper.zipBase64Array = function (base64Array, folderName, fileNames, callback, ctx) {
  var zip = new JSZip();
  Zipper.base64ArrayToBuffer(base64Array, function (buffers) {
    buffers.forEach(function (img, idx) {
      var name = [folderName, fileNames[idx]].join('/');
      zip.file(name, img);
    });
    var blob = zip.generate({type:"blob"});
    callback.call(ctx, blob);
  });
};

Zipper.zipImages = Zipper.zipBase64Array;

Zipper.base64ArrayToBuffer = function (base64DataArray, done, ctx) {
  var buffers = [];
  var buffersDone = 0;
  base64DataArray.forEach(function (data) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', data, true);
    xhr.responseType = "arraybuffer";
    xhr.onreadystatechange = function(evt) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          buffers.push(xhr.response);
          buffersDone++;
          if (buffersDone === base64DataArray.length) {
            done.call(ctx, buffers);
          }
        }
      }
    };
    xhr.send();
  });
}

module.exports = Zipper;
