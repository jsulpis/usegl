#include "./_common.glsl"

// sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
const mat3 ACESInputMat = mat3(
  vec3( 0.59719, 0.07600, 0.02840 ), // transposed from source
  vec3( 0.35458, 0.90834, 0.13383 ),
  vec3( 0.04823, 0.01566, 0.83777 )
);

// ODT_SAT => XYZ => D60_2_D65 => sRGB
const mat3 ACESOutputMat = mat3(
  vec3(  1.60475, -0.10208, -0.00327 ), // transposed from source
  vec3( -0.53108,  1.10813, -0.07276 ),
  vec3( -0.07367, -0.00605,  1.07602 )
);

// source: https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_blit.fs
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}

// Three.js implementation of ACES Filmic Tone Mapping
// source: https://github.com/mrdoob/three.js/blob/7f848acd7dc54062c50fca749211ecea0af8742b/src/renderers/shaders/ShaderChunk/tonemapping_pars_fragment.glsl.js#L46

vec3 toneMapping( vec3 color ) {
	color /= 0.6;

	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;

	return color;
}

#include "./_main.glsl"
