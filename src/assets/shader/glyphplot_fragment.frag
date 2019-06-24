varying  vec3 vColor; 
void main() {
    float r = 0.0, delta = 0.0, alpha = 1.0; 
    vec2 cxy = 2.0 * gl_PointCoord - 1.0; 
    r = dot(cxy, cxy); 
    delta = fwidth(r); 
    alpha = 1.0 - smoothstep(0.5 - delta, 0.5 + delta, r); 
    gl_FragColor = vec4(vColor, alpha);
}