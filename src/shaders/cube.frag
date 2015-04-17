uniform samplerCube cubemap;
uniform vec3 side;

varying vec3 pos;

void main() {
  vec3 reflDir = pos;

  reflDir.x *= -1.0;

  if (abs(side.x) > 0.0) {
    reflDir.xy = side.x < 0.0 ? vec2(reflDir.y, -reflDir.x) : reflDir.yx;
    reflDir.yz = reflDir.xy;
    reflDir.x = side.x;
  } else if (abs(side.y) > 0.0) {
    reflDir.y *= side.y > 0.0 ? 1.0 : -1.0;
    reflDir.xz = reflDir.xy;
    reflDir.y = side.y;
  } else if (abs(side.z) > 0.0) {
    reflDir.x *= side.z < 0.0 ? 1.0 : -1.0;
    reflDir.z = side.z;
  }

  gl_FragColor = textureCube(cubemap, reflDir);
  // gl_FragColor = vec4(reflDir, 1.0);
}