'use strict';

var OctahedronGeometry = require('./octahedronGeometry');

var QuadRenderer = function () {
  this.setupScene();
};

QuadRenderer.prototype.setupScene = function () {
  this.scene = new THREE.Scene();

  this.camera = new THREE.OrthographicCamera(
     -1,   1, // width
      1,  -1, // height
    0.5, 1.5 // near/far
  );
  this.camera.position.set(0, 0, 1);
  this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  this.camera.up.set(0, 0, 1);
};

QuadRenderer.prototype.renderQuad = function (renderer, quad, res, asBlob, done, ctx) {
  var quadToRender = quad.clone();
  this.scene.add(quadToRender);

  if (quad.geometry instanceof OctahedronGeometry) {
    quadToRender.position.set(-1, -1, 0);
    quadToRender.scale.set(2, 2, 2);
  } else {
    quadToRender.position.set(0, 0, 0);
  }

  var originalW = renderer.domElement.width;
  var originalH = renderer.domElement.height;
  renderer.setSize(res, res);

  renderer.render(this.scene, this.camera, false);

  var data = '';
  if (asBlob) {
    renderer.domElement.toBlob(function (blob) {
      done.call(ctx, blob);
    });
  } else {
    data = renderer.domElement.toDataURL("image/png");
  }

  // Clean up
  this.scene.remove(quadToRender);
  renderer.setSize(originalW, originalH);

  return data;
};

module.exports = QuadRenderer;
