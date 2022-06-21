float PI = 3.141592653589793238;

attribute vec3 instance_position; // Global position of the mesh, random scattering
attribute vec3 each_instance_position; 
uniform float time;
uniform vec2 pixels;
uniform float progress;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;

  // vec3 instancePosi = each_instance_position * 0.1 + instance_position; // position is from PlaneBufferGeo

  vec4 particle_position = modelMatrix * vec4(instance_position, 1.0); // * change the size of the whole

  vec4 view_position = viewMatrix * particle_position + vec4(each_instance_position, 1.0) * 0.1; // * change the size of each particle

  gl_Position = projectionMatrix * view_position; // Facing to the camera

  // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( instance_position + each_instance_position * 0.1, 1.0 ); // Facing the same direction
}