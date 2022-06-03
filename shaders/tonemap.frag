#define d(x) x/64.0
float dither8[8][8] = {
	{d( 0),d(48),d(12),d(60),d( 3),d(51),d(15),d(63)},
	{d(32),d(16),d(44),d(28),d(35),d(19),d(47),d(31)},
	{d( 8),d(56),d( 4),d(52),d(11),d(59),d( 7),d(55)},
	{d(40),d(24),d(36),d(20),d(43),d(27),d(39),d(23)},
	{d( 2),d(50),d(14),d(62),d( 1),d(49),d(13),d(61)},
	{d(34),d(18),d(46),d(30),d(33),d(17),d(45),d(29)},
	{d(10),d(58),d( 6),d(54),d( 9),d(57),d( 5),d(53)},
	{d(42),d(26),d(38),d(22),d(41),d(25),d(37),d(21)}
};

bool PowerOf(float num, float power) {
  return log(num)/log(power) - int(log(num)/log(power)) != 0 ? false : true;
}
bool PowerOf(int num, float power) { return PowerOf(float(num), power); }
bool PowerOf(float num, int power) { return PowerOf(num, float(power)); }
bool PowerOf(int num, int power) { return PowerOf(float(num), float(power)); }

void ApplyDither(inout vec4 color, vec2 texCoord, ivec2 texSize, float amount) {
	float diff = 1.0 / amount;
	if (color.r <= 0.0) color.r -= diff;
	if (color.g <= 0.0) color.g -= diff;
	if (color.b <= 0.0) color.b -= diff;
	if (color.r >= 1.0) color.r += diff;
	if (color.g >= 1.0) color.g += diff;
	if (color.b >= 1.0) color.b += diff;
	color.rgb += diff * dither8[int(texCoord.x * texSize.x) % 8][int(texCoord.y * texSize.y) % 8] - 0.5 * diff;
}

void ApplyLUT(inout vec4 color, sampler2D LUT) {
	ivec2 lutSize = textureSize(LUT, 0);
	vec3 lutColor;
	if (lutSize.x == lutSize.y * lutSize.y) { // Horizontal LUT
		lutColor = clamp(floor(color.rgb * lutSize.y), 0, lutSize.y - 1);
		color.rgb = texelFetch(LUT, ivec2(lutColor.r + lutColor.b * lutSize.x, lutColor.g), 0).rgb;
	}
	else if (lutSize.y == lutSize.x * lutSize.x) { // Vertical LUT
		lutColor = clamp(floor(color.rgb * lutSize.x), 0, lutSize.x - 1);
		color.rgb = texelFetch(LUT, ivec2(lutColor.r, lutColor.g + lutColor.b * lutSize.x), 0).rgb;
	}
	else if (lutSize.x == lutSize.y) {
		int size = int(pow(lutSize.x, (1.0 / 1.5)));
		if (PowerOf(size, 4)) { // Interleaved LUT
			lutColor = clamp(floor(color.rgb * size), 0, size - 1);
			int index = int((lutColor.b * size + lutColor.g) * size + lutColor.r);
			color.rgb = texelFetch(LUT, ivec2(index % lutSize.x, index / lutSize.x), 0).rgb;
		}
	}
}

void main() {
	vec4 color = texture(InputTexture, TexCoord);
	if (dither > 0) ApplyDither(color, TexCoord, textureSize(InputTexture, 0), 32);
	ApplyLUT(color, LUT);
	FragColor = color;
}