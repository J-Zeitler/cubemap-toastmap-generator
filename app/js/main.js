"use strict";

var urlParser = url;

var canvasContainer = document.getElementById('canvas-container');
var display = new PROJ.Display(canvasContainer);

display.init();
display.animate();

/**
 * Rotation controls
 */
var rotationController = document.getElementById('rotation-controller');
var rotationControllerDegs = document.getElementById('rotation-controller-degs');

var mouse = new THREE.Vector2();

var dragStart = function (event) {
  event.preventDefault();
  mouse.x = event.clientX;

  document.addEventListener('mousemove', drag, false);
};

var dragEnd = function (event) {
  document.removeEventListener('mousemove', drag, false);
};

var bgPos = 0;
var drag = function (event) {
  event.preventDefault();

  var newX = event.clientX;
  var dx = newX - mouse.x;
  bgPos += dx;

  rotationController.style.backgroundPosition = [bgPos, 'px ', 0].join('');
  rotationControllerDegs.style.backgroundPosition = [bgPos, 'px ', 0].join('');

  var rad = 2*Math.PI*bgPos/rotationController.offsetWidth;
  display.setSphereRotation(rad);

  mouse.x = newX;
};

rotationController.addEventListener('mousedown', dragStart, false);
document.addEventListener('mouseup', dragEnd, false);

/**
 * Download
 */
var cubemapButton = document.getElementById('cubemap-button');
var toastButton = document.getElementById('toast-button');
var cubemapRes = document.getElementById('cubemap-res');
var toastRes = document.getElementById('toast-res');

var downloadCubemap = function () {
  var originalText = cubemapButton.innerHTML;
  cubemapButton.innerHTML = 'Generating cubemap ...';
  cubemapButton.disabled = true;
  setTimeout(function () {
    display.downloadCubeMapImages(cubemapRes.value, function () {
      cubemapButton.disabled = false;
      cubemapButton.innerHTML = originalText;
    });
  }, 300);
};

var downloadToastMap = function () {
  var originalText = toastButton.innerHTML;
  toastButton.innerHTML = 'Generating toastmap ...';
  toastButton.disabled = true;
  setTimeout(function () {
    display.downloadToastMapImage(toastRes.value);
    toastButton.disabled = false;
    toastButton.innerHTML = originalText;
  }, 300);
};

/**
 * Drag-drop new image
 */

var dragging = 0;

var onImageLoaded = function (imageLoaded) {
  if (imageLoaded) {
    $.notify('Loaded new image!', 'success');
  } else {
    $.notify('Could not load image (probably due to cross-origin constraints)', 'error');
  }
  dragging = 0;
  dropzone.classList.remove('active');
}

var setNewImage = function (url) {
  var googleImageUrl = urlParser('?imgurl', url);
  if (googleImageUrl) {
    url = googleImageUrl;
  }

  var img = document.createElement('img');
  img.crossOrigin = '';
  img.onload = function () {
    display.setEquirectImage(img);
    rotationController.style.backgroundImage = ['url(', url, ')'].join('');
    dragging = 0;
    dropzone.classList.remove('active');
    onImageLoaded(true);
  }
  img.onerror = function () {
    onImageLoaded(false);
  }
  img.src = url;
}

var dropzone = document.getElementById('dropzone');
var loadNewImage = function (event) {
  event.preventDefault();
  event.stopPropagation();
  var files = event.dataTransfer.files;
  var items = event.dataTransfer.items;

  if (files.length) { // Local file
    var reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = function () {
      setNewImage(reader.result);
    };
  } else if (items && items.length) { // Chrome
    items[0].getAsString(function (url) {
      setNewImage(url);
    });
  } else if (event.dataTransfer.getData) { // FF
    var url = event.dataTransfer.getData('text');
    setNewImage(url);
  } else {
    onImageLoaded(false);
  }
};

var dragover = function (event) {
  event.preventDefault();
  event.stopPropagation();
};

var dragenter = function (event) {
  dragging++;
  event.preventDefault();
  event.stopPropagation();
  dropzone.classList.add('active');
};

var dragleave = function (event) {
  dragging--;
  event.preventDefault();
  event.stopPropagation();
  if(dragging === 0) {
    dropzone.classList.remove('active');
  }
};
