#include "./_common.glsl"

// filmic operator by Jim Hejl and Richard Burgess-Dawson
// http://filmicworlds.com/blog/filmic-tonemapping-operators/

vec3 toneMapping( vec3 color ) {
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}

#include "./_main.glsl"
