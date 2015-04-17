'use strict';

var ToastVert = require('./shaders').toastVert;
var ToastFrag = require('./shaders').toastFrag;

var CubeVert = require('./shaders').cubeVert;
var CubeFrag = require('./shaders').cubeFrag;

var CubeMapViewer = require('./cubeMapViewer');
var QuadRenderer = require('./quadRenderer');

var Display = function (canvasContainer) {
  this.container = canvasContainer;
  this.sphereOffsetAngle = 0.5*Math.PI;
  this.quadRenderer = new QuadRenderer();
};

Display.prototype.init = function (done, ctx) {
  this.camera = new THREE.PerspectiveCamera(90, this.container.offsetWidth/this.container.offsetHeight, 0.1, 100);
  this.camera.position.set(0, 0, 3);
  this.camera.lookAt(new THREE.Vector3(0, 0, 0));

  this.scene = new THREE.Scene();
  this.cubeScene = new THREE.Scene();

  this.renderer = new THREE.WebGLRenderer();
  this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
  this.renderer.setClearColor(0xffffff, 1);
  this.container.appendChild(this.renderer.domElement);

  this.cubeCamera = new THREE.CubeCamera(0.1, 10, 1024);
  this.cubeCamera.updateMatrixWorld();
  this.cubeCamera.renderTarget.minFilter = THREE.LinearMipMapNearestFilter;

  // default texture (from wikipedia)
  this.equirectTex = THREE.ImageUtils.loadTexture('textures/equirectangular-projection.jpg');
  this.equirectTex.wrapS = THREE.RepeatWrapping;

  /**
   * Sphere to render equirect texture on the inside of
   */
  this.sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 100, 50),
    new THREE.MeshBasicMaterial({
      map: this.equirectTex,
      side: THREE.BackSide,
      depthWrite: false
    })
  );
  this.sphere.rotation.y = this.sphereOffsetAngle;
  this.cubeScene.add(this.sphere);

  /**
   * TOAST map
   */
  this.octahedron = new THREE.Mesh(
    new PROJ.OctahedronGeometry(),
    new THREE.ShaderMaterial({
      vertexShader: ToastVert,
      fragmentShader: ToastFrag,
      uniforms: {
        cubemap: {type: 't', value: this.cubeCamera.renderTarget}
      }
    })
  );
  this.octahedron.scale.set(2.5, 2.5, 2.5);
  this.octahedron.position.x = -1.5;
  this.octahedron.position.y = -2.5;
  this.scene.add(this.octahedron);

  /**
   * Cube map
   */
  this.cubeSides = new CubeMapViewer(this.cubeCamera.renderTarget);
  this.scene.add(this.cubeSides);
  this.cubeSides.scale.set(0.4, 0.4, 0.4);
  this.cubeSides.position.x = -0.5;
  this.cubeSides.position.y = 1.5;

  this.raycaster = new THREE.Raycaster();
  this.mouse = new THREE.Vector2();

  /**
   * Event listeners
   */
  window.addEventListener('resize', this.handleWindowResize.bind(this), false);
};

Display.prototype.handleWindowResize = function (event) {
  this.camera.aspect = this.container.offsetWidth/this.container.offsetHeight;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
};

Display.prototype.animate = function () {
  this.renderer.render(this.scene, this.camera);
  this.cubeCamera.updateCubeMap(this.renderer, this.cubeScene);
  requestAnimationFrame(this.animate.bind(this));
}

/**
 * Downloaders
 */
Display.prototype.downloadCubeMapImages = function (faceRes, done, ctx) {
  this.cubeSides.renderToImages(this.renderer, faceRes, function () {
    done.call(ctx);
  }, this);
};

Display.prototype.downloadToastMapImage = function (faceRes) {
  var data = this.quadRenderer.renderQuad(this.renderer, this.octahedron, faceRes, true,
    function (blob) {
      saveAs(blob, "toastmap.png");
  });
};

/**
 * Scene interactions
 */
Display.prototype.setEquirectImage = function (img) {
  this.equirectTex.image = img;
  this.equirectTex.needsUpdate = true;
};

Display.prototype.setSphereRotation = function (rot) {
  this.sphere.rotation.y = this.sphereOffsetAngle + rot;
};

module.exports = Display;
