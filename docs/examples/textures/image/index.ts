import { loadTexture, useWebGLCanvas } from "usegl";
import "./styles.css";
import fragment from "./fragment.glsl?raw";
import vertex from "./vertex.glsl?raw";

const texture = loadTexture("https://picsum.photos/id/669/600/400", {
  // the placeholder is optional
  placeholder: {
    data: new Uint8Array(
      [
        [255, 255, 255, 255],
        [255, 255, 255, 255],
        [255, 255, 255, 255],
        [255, 255, 255, 255],
        [99, 46, 22, 255],
        [255, 255, 255, 255],
      ].flat(),
    ),
    width: 3,
    height: 2,
    //magFilter: "nearest",
  },
});

useWebGLCanvas({
  canvas: "#glCanvas",
  vertex,
  fragment,
  uniforms: {
    uTexture: texture,
  },
});
