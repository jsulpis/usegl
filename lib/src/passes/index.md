# Passes

The `passes` modules form the rendering pipeline abstraction layer of the library.

- `renderPass` is the generic primitive.
- `quadRenderPass` specializes it for full-screen work.
- `effectPass`, `compositeEffectPass`, and `compositor` build post-processing chains.
- `pingPongFBO` and `transformFeedback` cover common GPGPU workflows.
