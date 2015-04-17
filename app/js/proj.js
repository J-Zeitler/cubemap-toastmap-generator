(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PROJ = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

this.shaders = require('./shaders');
this.OctahedronGeometry = require('./octahedronGeometry');
this.CubeMapViewer = require('./cubeMapViewer');
this.QuadRenderer = require('./quadRenderer');

this.Display = require('./display');

// this.MercatorReprojector = require('mercatorReprojector');
// this.EquirectangularReprojector = require('./equirectangularReprojector');

},{"./cubeMapViewer":2,"./display":3,"./octahedronGeometry":4,"./quadRenderer":5,"./shaders":6}],2:[function(require,module,exports){
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

},{"./quadRenderer":5,"./shaders":6,"./zipper":7}],3:[function(require,module,exports){
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

},{"./cubeMapViewer":2,"./quadRenderer":5,"./shaders":6}],4:[function(require,module,exports){
'use strict';

var OctahedronGeometry = function () {
  THREE.BufferGeometry.call(this);

  this.type = 'OctahedronGeometry';

  var positions = new Float32Array([
     0,  1,  0, //  y
     1,  0,  0, //  x
    -1,  0,  0, // -x
     0,  0,  1, //  z
     0,  0, -1, // -z
     0, -1,  0, // -y (split)
     0, -1,  0, // -y (split)
     0, -1,  0, // -y (split)
     0, -1,  0  // -y (split)
  ]);

  // TOAST uvs
  var uvs = new Float32Array([
    0.5, 0.5, //  y
    0.5, 1.0, //  x
    0.5, 0.0, // -x
    1.0, 0.5, //  z
    0.0, 0.5, // -z

    1.0, 1.0, // -y
    0.0, 1.0, // -y
    0.0, 0.0, // -y
    1.0, 0.0  // -y
  ]);

  var indices = new Uint16Array([
    // upper hemisphere
    0, 3, 1,
    0, 1, 4,
    0, 4, 2,
    0, 2, 3,

    // lower hemisphere
    5, 1, 3,
    6, 4, 1,
    7, 2, 4,
    8, 3, 2
  ]);


  this.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  this.addAttribute('index', new THREE.BufferAttribute(indices, 1));
  this.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  this.computeBoundingBox();
};

OctahedronGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
OctahedronGeometry.prototype.constructor = OctahedronGeometry;

module.exports = OctahedronGeometry;

},{}],5:[function(require,module,exports){
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

},{"./octahedronGeometry":4}],6:[function(require,module,exports){
'use strict';



module.exports.cubeVert = "uniform float scale;\n\nvarying vec3 pos;\n\nvec3 cube2sphere(vec3 cube) {\n  cube /= scale;\n\n  float x2 = cube.x*cube.x;\n  float y2 = cube.y*cube.y;\n  float z2 = cube.z*cube.z;\n  vec3 sphere = vec3(\n    cube.x*sqrt(1.0 - y2*0.5 - z2*0.5 + y2*z2*0.3333333),\n    cube.y*sqrt(1.0 - x2*0.5 - z2*0.5 + x2*z2*0.3333333),\n    cube.z*sqrt(1.0 - x2*0.5 - y2*0.5 + x2*y2*0.3333333)\n  );\n\n  return sphere*scale;\n}\n\nvoid main() {\n  pos = position;\n\n  vec3 spherePos = (modelMatrix*vec4(position, 1.0)).xyz;\n  spherePos = cube2sphere(position);\n\n  gl_Position = projectionMatrix *\n                modelViewMatrix *\n                vec4(position, 1.0);\n}\n";
module.exports.cubeFrag = "uniform samplerCube cubemap;\nuniform vec3 side;\n\nvarying vec3 pos;\n\nvoid main() {\n  vec3 reflDir = pos;\n\n  reflDir.x *= -1.0;\n\n  if (abs(side.x) > 0.0) {\n    reflDir.xy = side.x < 0.0 ? vec2(reflDir.y, -reflDir.x) : reflDir.yx;\n    reflDir.yz = reflDir.xy;\n    reflDir.x = side.x;\n  } else if (abs(side.y) > 0.0) {\n    reflDir.y *= side.y > 0.0 ? 1.0 : -1.0;\n    reflDir.xz = reflDir.xy;\n    reflDir.y = side.y;\n  } else if (abs(side.z) > 0.0) {\n    reflDir.x *= side.z < 0.0 ? 1.0 : -1.0;\n    reflDir.z = side.z;\n  }\n\n  gl_FragColor = textureCube(cubemap, reflDir);\n  // gl_FragColor = vec4(reflDir, 1.0);\n}";

module.exports.toastVert = "varying vec3 octahedronPos;\n\nvoid main() {\n  octahedronPos = position;\n\n  gl_Position = projectionMatrix *\n                modelViewMatrix *\n                vec4(uv, 0.0, 1.0);\n}\n";
module.exports.toastFrag = "uniform samplerCube cubemap;\n\nvarying vec3 octahedronPos;\n\n#define isqrt2 0.70710676908493042\nvec3 cubify(vec3 s) {\n  float xx2 = s.x*s.x*2.0;\n  float yy2 = s.y*s.y*2.0;\n\n  vec2 vCube = vec2(xx2 - yy2, yy2 - xx2);\n\n  float ii = vCube.y - 3.0;\n  ii *= ii;\n\n  float isqrt = -sqrt(ii - 12.0*xx2) + 3.0;\n\n  vCube = sqrt(vCube + isqrt);\n  vCube *= isqrt2;\n\n  return sign(s)*vec3(vCube, 1.0);\n}\n\nvec3 sphere2cube(vec3 sphere) {\n  vec3 f = abs(sphere);\n\n  bool a = f.y >= f.x && f.y >= f.z;\n  bool b = f.x >= f.z;\n\n  return a ? cubify(sphere.xzy).xzy : b ? cubify(sphere.yzx).zxy : cubify(sphere);\n}\n\nvoid main() {\n  vec3 reflDir = sphere2cube(normalize(octahedronPos));\n\n  gl_FragColor = textureCube(cubemap, reflDir);\n}";

},{}],7:[function(require,module,exports){
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

},{}]},{},[1])(1)
});


//# sourceMappingURL=proj.js.map