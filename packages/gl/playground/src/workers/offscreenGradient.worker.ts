import { glCanvas, type GLCanvas } from "@radiance/gl";

type InitMessage = {
  type: "init";
  canvas: OffscreenCanvas;
};

type ResizeMessage = {
  type: "resize";
  size: {
    width: number;
    height: number;
  };
};

type WorkerMessage = InitMessage | ResizeMessage;

addEventListener("message", (event: MessageEvent<WorkerMessage>) => {
  switch (event.data.type) {
    case "init":
      init(event.data);
      break;
    case "resize":
      resize(event.data);
      break;
  }
});

let scene: GLCanvas;

function init(message: InitMessage) {
  scene = glCanvas({
    canvas: message.canvas,
    fragment: /* glsl */ `
      varying vec2 uv;
			uniform vec2 resolution;

			void main() {
				vec2 center = resolution / 2.;
				float dist = distance(uv * resolution, center);
				float radius = min(resolution.x, resolution.y) / 3.;
				float circle = 1. - smoothstep(radius * .99, radius * 1.01, dist);
				gl_FragColor = vec4(vec3(circle), 1.);
			}
    `,
  });

  scene.onAfterRender(() => {
    postMessage({ type: "rendered" });
  });
}

function resize(message: ResizeMessage) {
  scene?.setSize(message.size);
}
