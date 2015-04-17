'use strict';

var QuadRenderer = require('./quadRenderer');
var Zipper = require('./zipper');

var CubeVert = require('./shaders').cubeVert;
var CubeFrag = require('./shaders').cubeFrag;

/**
 * Order of children is:
 *
 * 0,   1,    2,    3,     4,     5
 * top, left, back, right, front, bottom
 *
 */
var CubeMapViewer = function (map) {
  THREE.Object3D.call(this);

  this.map = map;
  if (!(this.map instanceof THREE.WebGLRenderTargetCube)) {
    throw "CubeMapViewer: needs a 'THREE.WebGLRenderTargetCube' to construct";
  }

  this.quadRenderer = new QuadRenderer();

  var quadMaterial = new THREE.ShaderMaterial({
    vertexShader: CubeVert,
    fragmentShader: CubeFrag,
    uniforms: {
      cubemap: {type: 't', value: map},
      side: {type: 'v3', value: new THREE.Vector3()}
    }
  });

  // top
  var mat = quadMaterial.clone();
  mat.uniforms.side.value = new THREE.Vector3(0, 1, 0);
  var quad = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2, 1, 1),
    mat
  );

  this.add(quad);
  quad.position.x = 0;
  quad.position.y = 2;

  // left
  mat = quadMaterial.clone();
  mat.uniforms.side.value = new THREE.Vector3(1, 0, 0);
  quad = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2, 1, 1),
    mat
  );
  this.add(quad);
  quad.position.x = -2;
  quad.position.y = 0;

  // back
  mat = quadMaterial.clone();
  mat.uniforms.side.value = new THREE.Vector3(0, 0, -1);
  quad = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2, 1, 1),
    mat
  );
  this.add(quad);
  quad.position.x = 0;
  quad.position.y = 0;

  // right
  mat = quadMaterial.clone();
  mat.uniforms.side.value = new THREE.Vector3(-1, 0, 0);
  quad = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2, 1, 1),
    mat
  );
  this.add(quad);
  quad.position.x = 2;
  quad.position.y = 0;

  // front
  mat = quadMaterial.clone();
  mat.uniforms.side.value = new THREE.Vector3(0, 0, 1);
  quad = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2, 1, 1),
    mat
  );
  this.add(quad);
  quad.position.x = 4;
  quad.position.y = 0;

  // bottom
  mat = quadMaterial.clone();
  mat.uniforms.side.value = new THREE.Vector3(0, -1, 0);
  quad = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2, 1, 1),
    mat
  );
  this.add(quad);
  quad.position.x = 0;
  quad.position.y = -2;
};

CubeMapViewer.prototype = Object.create(THREE.Object3D.prototype);

CubeMapViewer.prototype.renderToImages = function (renderer, faceRes, done, ctx) {
  var faceData = [];
  this.children.forEach(function (face) {
    faceData.push(this.quadRenderer.renderQuad(renderer, face, faceRes));
  }, this);

  Zipper.zipImages(faceData, CubeMapViewer.id, CubeMapViewer.faceNames, function (zipBlob) {
    saveAs(zipBlob, CubeMapViewer.id + '.zip');
    done.call(ctx);
  }, this);
};

/**
 * Static
 */

CubeMapViewer.id = 'cubemap';
CubeMapViewer.faceNames = ['py.png', 'nx.png', 'pz.png', 'px.png', 'nz.png', 'ny.png'];

module.exports = CubeMapViewer;
