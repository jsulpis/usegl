import { useWebGLCanvas } from "usegl";
import fragment from "./fragment.glsl?raw";
import "./styles.css";

useWebGLCanvas({
  canvas: "#glCanvas",
  fragment,
});
