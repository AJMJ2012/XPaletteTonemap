// 8x8 Ordered Dither
int dither8[64] = int[] (
	 0,48,12,60, 3,51,15,63,
	32,16,44,28,35,19,47,31,
	 8,56, 4,52,11,59, 7,55,
	40,24,36,20,43,27,39,23,
	 2,50,14,62, 1,49,13,61,
	34,18,46,30,33,17,45,29,
	10,58, 6,54, 9,57, 5,53,
	42,26,38,22,41,25,37,21
);

void ApplyDither(inout vec4 color, vec2 texCoord, ivec2 texSize, int factor) {
	float diff = 1.0 / float(factor);
	// I wonder if these are even required.
	if (color.r <= 0.0) color.r -= diff;
	if (color.g <= 0.0) color.g -= diff;
	if (color.b <= 0.0) color.b -= diff;
	if (color.r >= 1.0) color.r += diff;
	if (color.g >= 1.0) color.g += diff;
	if (color.b >= 1.0) color.b += diff;
	color.rgb += diff * dither8[int(texCoord.x * texSize.x) % 8 + int(texCoord.y * texSize.y) % 8 * 8] / 64.0 - 0.5 * diff;
}

void ApplyLUT(inout vec4 color, sampler2D LUT) {
	ivec2 lutSize = textureSize(LUT, 0);
	int size = int(pow(lutSize.x, (1.0 / 1.5)));
	vec3 lutColor = clamp(floor(color.rgb * size), 0, size - 1);
	int index = int((lutColor.b * size + lutColor.g) * size + lutColor.r);
	color.rgb = texelFetch(LUT, ivec2(index % lutSize.x, index / lutSize.x), 0).rgb;
}

void main() {
	vec4 color = texture(InputTexture, TexCoord);
	if (dither > 0) ApplyDither(color, TexCoord, textureSize(InputTexture, 0), 32);
	ApplyLUT(color, LUT);
	FragColor = color;
}