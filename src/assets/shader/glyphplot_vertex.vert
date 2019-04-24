attribute float size; 
varying vec3 vColor; 
void main() { 
    vColor = color; 
    vec4 centerPos = vec4(position.x, position.y, position.z, 1.0);
    vec4 mvPosition = modelViewMatrix * centerPos; 
    gl_PointSize = size;
    gl_Position = projectionMatrix * mvPosition; 
}