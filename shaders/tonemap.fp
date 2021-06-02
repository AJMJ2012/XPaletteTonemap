vec3 Tonemap(vec3 color){
    float size = textureSize(LUT, 0).y;
    color = clamp(color, vec3(0.5 / size), vec3(1.0 - 0.5 / size));
    return texelFetch(LUT, ivec2(vec2(color.r + int(color.b * size), color.g) * size), 0).rgb;
}

void main() {
	FragColor = vec4(Tonemap(texture(InputTexture, TexCoord).rgb), 1.0);
}
