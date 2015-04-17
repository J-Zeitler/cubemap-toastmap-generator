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
