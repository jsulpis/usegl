export const vertexShaderSource = /*glsl*/ `
in vec2 a_position;
out vec2 vUv;
uniform vec2 u_resolution;

void main() {
	 vUv = (a_position + 1.0) / 2.0;
	 gl_Position = vec4(a_position, 0.0, 1.0);
	 gl_PointSize = u_resolution.x / pow(30.0, .8 + length(vUv - 0.5));
}
`;

export const fragmentShaderSource = /*glsl*/ `
out vec4 outColor;
in vec2 vUv;

void main() {
	 outColor = vec4(vUv.x, vUv.y, 1.0, 1.0);
}
`;

export const mipmapFragmentShaderSource = /*glsl*/ `
uniform sampler2D u_image;
uniform vec2 u_resolution;

in vec2 vUv;
out vec4 outColor;

vec2 CalcOffset(float octave) {
	 vec2 offset = vec2(0.0);
	 vec2 padding = vec2(10.0) / u_resolution.xy;

	 offset.x = -min(1.0, floor(octave / 3.0)) * (0.25 + padding.x);

	 offset.y = -(1.0 - (1.0 / exp2(octave))) - padding.y * octave;
	 offset.y += min(1.0, floor(octave / 3.0)) * (0.35 + padding.y);

	 return offset;
}


vec3 mipmapLevel(float octave) {
	 float scale = exp2(octave);
	 vec2 offset = CalcOffset(octave - 1.);
	 vec2 coord = (vUv + offset) * scale;

	 if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0) {
			return vec3(0.0);
	 }

	 vec3 color = vec3(0.0);
	 float weights = 0.0;

	 int spread = int(scale);

	 for (int i = 0; i < spread; i++) {
			for (int j = 0; j < spread; j++) {
				 vec2 off = (vec2(i, j) / u_resolution.xy + vec2(0.0) / u_resolution.xy) * scale / float(spread);
				 color += texture(u_image, coord + off).rgb;

				 weights += 1.0;
			}
	 }

	 color /= weights;

	 return color;
}

 void main() {
	 vec3 color = mipmapLevel(1.0);
	 color += mipmapLevel(2.0);
	 color += mipmapLevel(3.0);
	 color += mipmapLevel(4.0);

	 outColor = vec4(color, 1.0);
 }
`;

export const blurFragmentShaderSource = /*glsl*/ `
uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform vec2 u_direction;
in vec2 vUv;
out vec4 outColor;

vec3 ColorFetch(vec2 coord) {
	 return texture(u_image, coord).rgb;
}

float weights[5];
float offsets[5];


void main() {
	 weights[0] = 0.19638062;
	 weights[1] = 0.29675293;
	 weights[2] = 0.09442139;
	 weights[3] = 0.01037598;
	 weights[4] = 0.00025940;

	 offsets[0] = 0.00000000;
	 offsets[1] = 1.41176471;
	 offsets[2] = 3.29411765;
	 offsets[3] = 5.17647059;
	 offsets[4] = 7.05882353;

 vec2 uv = vUv;

 vec3 color = vec3(0.0);
 float weightSum = 0.0;

 if (uv.x < 0.52) {
		 color += ColorFetch(uv) * weights[0];
		 weightSum += weights[0];

		 for(int i = 1; i < 5; i++)
		 {
				 vec2 offset = vec2(offsets[i]) / u_resolution.xy;
				 color += ColorFetch(uv + offset * .5 * u_direction) * weights[i];
				 color += ColorFetch(uv - offset * .5 * u_direction) * weights[i];
				 weightSum += weights[i] * 2.0;
		 }

		 color /= weightSum;
 }

 outColor = vec4(color,1.0);
}
`;

export const combineFragmentShaderSource = /* glsl */ `
uniform sampler2D u_image;
uniform sampler2D u_bloomTexture;
uniform vec2 u_resolution;
in vec2 vUv;
out vec4 outColor;



vec3 ColorFetch(vec2 coord) {
return texture(u_image, coord).rgb;
}

vec3 BloomFetch(vec2 coord) {
return texture(u_bloomTexture, coord).rgb;
}


vec3 Grab(vec2 coord, const float octave, const vec2 offset)
{
float scale = exp2(octave);

 coord /= scale;
 coord -= offset;

 return BloomFetch(coord);
}

vec2 CalcOffset(float octave) {
vec2 offset = vec2(0.0);

vec2 padding = vec2(10.0) / u_resolution.xy;

offset.x = -min(1.0, floor(octave / 3.0)) * (0.25 + padding.x);

offset.y = -(1.0 - (1.0 / exp2(octave))) - padding.y * octave;
offset.y += min(1.0, floor(octave / 3.0)) * (0.35 + padding.y);

return offset + .5 / u_resolution.xy;
}

vec3 GetBloom(vec2 coord) {
vec3 bloom = vec3(0.0);

//Reconstruct bloom from multiple blurred images
bloom += Grab(coord, 1.0, vec2(CalcOffset(0.0))) * .8;
//  bloom += Grab(coord, 2.0, vec2(CalcOffset(1.0))) * .4;
bloom += Grab(coord, 3.0, vec2(CalcOffset(2.0))) * .5;
bloom += Grab(coord, 4.0, vec2(CalcOffset(3.0))) * 1.2;

return bloom;
}

void main() {
	 vec4 baseColor = texture(u_image, vUv);
	 vec4 bloomColor = vec4(GetBloom(vUv), 1);

	 outColor = baseColor;

	 outColor = baseColor + bloomColor;
}
`;
