varying vec3 octahedronPos;

void main() {
  octahedronPos = position;

  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(uv, 0.0, 1.0);
}
