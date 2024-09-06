import { createBuffer } from "./createBuffer";
import { createProgram } from "./createProgram";
import { quadVertexPositions, quadVertexShaderSource } from "./quad";
import { useWebGLContext } from "./useWebGLContext";

type VectorUniform = [number, number] | [number, number, number] | [number, number, number, number];
type UniformValue = number | VectorUniform;
type UniformsObj = Record<string, UniformValue> | {};

interface WebGLCanvasProps<Uniforms extends UniformsObj> {
	canvas: HTMLCanvasElement | OffscreenCanvas;
	fragment: string;
	vertex?: string;
	uniforms?: Uniforms;
	webglContextOptions?: WebGLContextAttributes;
}

export const useWebGLCanvas = <Uniforms extends UniformsObj>(props: WebGLCanvasProps<Uniforms>) => {
	const { canvas, fragment, vertex, uniforms, webglContextOptions } = props;
	type UniformName = Extract<keyof Uniforms, string>;

	const { gl, setSize: setCanvasSize } = useWebGLContext(canvas, webglContextOptions);
	if (!gl) return { setSize: () => {} };

	const program = createProgram(gl, fragment, vertex || quadVertexShaderSource);
	gl.useProgram(program);

	const positionsBuffer = createBuffer(gl, quadVertexPositions);
	gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
	const positionAttributeLocation = gl.getAttribLocation(program, "aPosition");
	gl.enableVertexAttribArray(positionAttributeLocation);
	gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

	const timeUniformLocation = gl.getUniformLocation(program, "uTime");
	const resolutionUniformLocation = gl.getUniformLocation(program, "uResolution");

	requestAnimationFrame(function renderLoop(time) {
		requestAnimationFrame(renderLoop);
		gl.uniform1f(timeUniformLocation, time / 500);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	});

	function setSize({ width, height }: { width: number; height: number }) {
		setCanvasSize(width, height);
		gl.uniform2f(resolutionUniformLocation, width, height);
	}

	const uniformsLocations =
		uniforms != undefined
			? new Map(
					Object.keys(uniforms).map((uniformName) => [
						uniformName,
						gl.getUniformLocation(program, uniformName),
					])
			  )
			: new Map();

	const uniformsProxy =
		uniforms != undefined
			? new Proxy(uniforms, {
					set(target, prop: UniformName, value) {
						const result = setUniform(prop, value);
						Object.assign(target, { [prop]: value });
						return result !== -1;
					},
			  })
			: uniforms;

	function setUniform<U extends UniformName>(uniform: U, value: Uniforms[U]): void | -1 {
		const uniformLocation = uniformsLocations.get(uniform);
		if (uniformLocation === -1) return -1;

		if (typeof value === "number") return gl.uniform1f(uniformLocation, value);

		if (Array.isArray(value)) {
			switch (value.length) {
				case 2:
					return gl.uniform2fv(uniformLocation, value);
				case 3:
					return gl.uniform3fv(uniformLocation, value);
				case 4:
					return gl.uniform4fv(uniformLocation, value);
			}
		}
	}

	return { canvas, setSize, setUniform, uniforms: uniformsProxy, gl };
};
