import type { TextureUniform } from "../types";

export type TextureData = ArrayBufferView | null;

export function createTexture(
	gl: WebGL2RenderingContext,
	{
		data = null,
		src,
		width,
		height,
	}:
		| { data: TextureData; src?: never; width: number; height: number }
		| { data?: never; src: TexImageSource; width?: never; height?: never },
) {
	const texture = gl.createTexture();

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, src !== undefined);

	if (src === undefined) {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
	} else {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
	}

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	return texture;
}

export function loadTexture(src: string): Promise<TextureUniform> {
	const img = document.createElement("img");
	img.src = src;

	return new Promise((resolve) => {
		img.addEventListener(
			"load",
			() => {
				resolve({ src: img });
			},
			{ once: true },
		);
	});
}
