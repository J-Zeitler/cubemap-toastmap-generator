uniform float scale;

varying vec3 pos;

vec3 cube2sphere(vec3 cube) {
  cube /= scale;

  float x2 = cube.x*cube.x;
  float y2 = cube.y*cube.y;
  float z2 = cube.z*cube.z;
  vec3 sphere = vec3(
    cube.x*sqrt(1.0 - y2*0.5 - z2*0.5 + y2*z2*0.3333333),
    cube.y*sqrt(1.0 - x2*0.5 - z2*0.5 + x2*z2*0.3333333),
    cube.z*sqrt(1.0 - x2*0.5 - y2*0.5 + x2*y2*0.3333333)
  );

  return sphere*scale;
}

void main() {
  pos = position;

  vec3 spherePos = (modelMatrix*vec4(position, 1.0)).xyz;
  spherePos = cube2sphere(position);

  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position, 1.0);
}
