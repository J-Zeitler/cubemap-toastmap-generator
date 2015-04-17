uniform samplerCube cubemap;

varying vec3 octahedronPos;

#define isqrt2 0.70710676908493042
vec3 cubify(vec3 s) {
  float xx2 = s.x*s.x*2.0;
  float yy2 = s.y*s.y*2.0;

  vec2 vCube = vec2(xx2 - yy2, yy2 - xx2);

  float ii = vCube.y - 3.0;
  ii *= ii;

  float isqrt = -sqrt(ii - 12.0*xx2) + 3.0;

  vCube = sqrt(vCube + isqrt);
  vCube *= isqrt2;

  return sign(s)*vec3(vCube, 1.0);
}

vec3 sphere2cube(vec3 sphere) {
  vec3 f = abs(sphere);

  bool a = f.y >= f.x && f.y >= f.z;
  bool b = f.x >= f.z;

  return a ? cubify(sphere.xzy).xzy : b ? cubify(sphere.yzx).zxy : cubify(sphere);
}

void main() {
  vec3 reflDir = sphere2cube(normalize(octahedronPos));

  gl_FragColor = textureCube(cubemap, reflDir);
}