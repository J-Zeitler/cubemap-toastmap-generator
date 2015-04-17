'use strict';

var fs = require('fs');

module.exports.cubeVert = fs.readFileSync(__dirname + '/cube.vert', 'utf8');
module.exports.cubeFrag = fs.readFileSync(__dirname + '/cube.frag', 'utf8');

module.exports.toastVert = fs.readFileSync(__dirname + '/toast.vert', 'utf8');
module.exports.toastFrag = fs.readFileSync(__dirname + '/toast.frag', 'utf8');
