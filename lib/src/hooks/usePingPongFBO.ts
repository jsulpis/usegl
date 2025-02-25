import { createRenderTarget } from "../core/renderTarget";
import { createFloatDataTexture, type DataTextureParams } from "../core/texture";
import type { Attribute, RenderPass, Uniforms } from "../types";
import { useQuadRenderPass } from "./useQuadRenderPass";

export type PingPongFBOOptions<U extends Uniforms = Record<string, never>> = {
  uniforms?: U;
  fragment: string;
  dataTexture: {
    name?: string;
    initialData: Float32Array | number[];
  };
};

interface PingPongFBOPass<U extends Uniforms = Record<string, never>> extends RenderPass<U> {
  outputTexture: DataTextureParams | WebGLTexture;
  coordsAttribute: Attribute;
}

export function usePingPongFBO<U extends Uniforms>(
  gl: WebGL2RenderingContext,
  { uniforms = {} as U, dataTexture, fragment }: PingPongFBOOptions<U>,
) {
  // enable the extension for float textures
  gl.getExtension("EXT_color_buffer_float");

  const { initialData, name: dataTextureName = "tData" } = dataTexture;
  const elementsCount = initialData.length / 4;

  const initialDataTexture = createFloatDataTexture(initialData);
  const { data: _, ...textureParams } = initialDataTexture;

  const coords = new Float32Array(elementsCount * 2);
  for (let i = 0; i < elementsCount; i++) {
    const x = (i % textureParams.width) / textureParams.width;
    const y = Math.floor(i / textureParams.height) / textureParams.height;
    coords.set([x, y], i * 2);
  }

  const fboPass = useQuadRenderPass(gl, {
    fragment,
    uniforms: Object.assign(uniforms, {
      [dataTextureName]: initialDataTexture,
    }),
  });

  const pingPongFBOPass: PingPongFBOPass<U> = Object.assign(fboPass, {
    outputTexture: initialDataTexture,
    coordsAttribute: {
      data: coords,
      size: 2,
    },
  });

  let fboRead = createRenderTarget(gl, textureParams);
  let fboWrite = createRenderTarget(gl, textureParams);

  function swap() {
    const temp = fboRead;
    fboRead = fboWrite;
    fboWrite = temp;
  }

  const renderFn = pingPongFBOPass.render;

  pingPongFBOPass.render = () => {
    renderFn({ target: fboWrite });
    pingPongFBOPass.outputTexture = fboWrite.texture;
    Object.assign(pingPongFBOPass.uniforms, {
      [dataTextureName]: () => fboRead.texture,
    });
    swap();
  };

  return pingPongFBOPass;
}
