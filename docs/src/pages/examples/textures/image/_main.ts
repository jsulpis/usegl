import { loadTexture, useWebGLCanvas } from "usegl";
import "./styles.css";
import fragment from "./fragment.glsl?raw";
import vertex from "./vertex.glsl?raw";

(async () => {
  const texture = await loadTexture("https://picsum.photos/id/669/600/400");

  useWebGLCanvas({
    canvas: "#glCanvas",
    vertex,
    fragment,
    uniforms: {
      uTexture: texture,
    },
  });
})();
