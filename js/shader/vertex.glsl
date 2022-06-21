float PI = 3.141592653589793238;

attribute vec3 pos; // Global position of the mesh, random scattering

uniform float time;
uniform vec2 pixels;
uniform float progress;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vec3 instancePosi = position * 0.01 + pos ; // position is from PlaneBufferGeo

  vec3 particle_position = (modelMatrix * vec4(pos, 1.0)).xyz; // * change the size of the whole

  vec4 view_pos = viewMatrix * vec4(particle_position, 1.0);

  view_pos.xyz = view_pos.xyz + position * 0.1; // * change the size of each particle

  gl_Position = projectionMatrix * view_pos;

  // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( instancePosi, 1.0 );
}