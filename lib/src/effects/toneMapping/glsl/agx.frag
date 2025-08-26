uniform sampler2D uTexture;
uniform float uExposure;

varying vec2 vUv;

// Matrices for rec 2020 <> rec 709 color space conversion
// matrix provided in row-major order so it has been transposed
// https://www.itu.int/pub/R-REP-BT.2407-2017
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);

const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);

// https://iolite-engine.com/blog_posts/minimal_agx_implementation
// Mean error^2: 3.6705141e-06
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;

	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}

// AgX constants
const mat3 AgXInsetMatrix = mat3(
  vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
  vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
  vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
);

// explicit AgXOutsetMatrix generated from Filaments AgXOutsetMatrixInv
const mat3 AgXOutsetMatrix = mat3(
  vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
  vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
  vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
);

// LOG2_MIN      = -10.0
// LOG2_MAX      =  +6.5
// MIDDLE_GRAY   =  0.18
const float AgxMinEv = - 12.47393;  // log2( pow( 2, LOG2_MIN ) * MIDDLE_GRAY )
const float AgxMaxEv = 4.026069;    // log2( pow( 2, LOG2_MAX ) * MIDDLE_GRAY )


// Three.js implementation of AgX Tone Mapping, based on Filament, based on Blender
// source: https://github.com/mrdoob/three.js/blob/c5e5c609904ff38e701f7cafccbd454d363019c7/src/renderers/shaders/ShaderChunk/tonemapping_pars_fragment.glsl.js#L113

vec3 AgXToneMapping( vec3 color ) {
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;

	// Log2 encoding
	color = max( color, 1e-10 ); // avoid 0 or negative numbers for log2
	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );

	color = clamp( color, 0.0, 1.0 );

	// Apply sigmoid
	color = agxDefaultContrastApprox( color );

	color = AgXOutsetMatrix * color;

	// Linearize
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );

	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;

	return color;
}

void main() {
  vec4 color = texture(uTexture, vUv) * uExposure;
  color.rgb = AgXToneMapping(color.rgb);
  gl_FragColor = clamp(color, 0.0, 1.0);
}
