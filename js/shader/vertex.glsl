float PI = 3.141592653589793238;

attribute vec3 pos; // Global position of the mesh, random scattering

uniform float time;
uniform vec2 pixels;
uniform float progress;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vec3 instancePosi = position + pos; // position is from PlaneBufferGeo
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( instancePosi, 1.0 );
}