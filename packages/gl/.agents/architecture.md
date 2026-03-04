# Architecture & Conventions

## Directory Structure (`lib/src/`)

```
src/
├── core/             ← low-level WebGL2 primitives (program, shader, buffer, texture…)
└── effects/          ← built-in post-processing effects (bloom, trails, toneMapping)
├── global/           ← entry points and state management (glCanvas, glContext)
├── internal/         ← private implementation helpers (not exported from index.ts)
├── passes/           ← rendering nodes and graphs (renderPass, compositor, pingPongFBO)
├── index.ts          ← public API barrel export (only file that re-exports)
├── types.ts          ← primitive shared types (UniformValue, Attribute, DrawMode)
```

- New global managers → `global/`, new rendering passes → `passes/`, new internals → `internal/`, new effects → `effects/`.
- **Colocation**: Component-specific types (e.g., `RenderTargetParams`, `BloomParams`) live in their respective source files.
- `types.ts` contains only "primitive" shared types — avoid defining shared types inline.
- `index.ts` is the only barrel; do not create barrel files within subdirectories.

## Naming Conventions

| Kind                        | Convention                       | Example                               |
| --------------------------- | -------------------------------- | ------------------------------------- |
| factory functions           | `camelCase`                      | `renderPass`, `createProgram`         |
| Types / Interfaces          | `PascalCase`                     | `RenderPass<U>`, `TextureOptions`     |
| Settings / Params / Options | "Params" suffix                  | `RenderTargetParams`, `BloomParams`   |
| Private closure variables   | `_camelCase` (underscore prefix) | `_gl`, `_program`, `_target`          |
| Module-level constants      | `camelCase` for objects/arrays   | `quadVertexPositions`                 |
| GL enum-like constants      | `SCREAMING_SNAKE_CASE`           | `UNSIGNED_INT`                        |
| GLSL uniforms               | `u` prefix                       | `uTexelSize`, `uMix`, `uBloomTexture` |
| GLSL attributes             | `a` prefix                       | `aPosition`                           |
| GLSL varyings               | `v` prefix                       | `vUv`                                 |
| Effect factory functions    | `camelCase`                      | `bloom()`, `trails()`                 |
| Global/Pass files           | `<camelCase>.ts`                 | `renderPass.ts`, `glCanvas.ts`        |
| Core utility files          | `<noun>.ts`                      | `program.ts`, `texture.ts`            |

## Architecture Patterns

- **Closure-based functions** — no classes. Every factory function closes over private mutable state (prefixed `_`) and returns a plain object API with getter properties.
- **`createHook<C>()`** is the internal pub/sub primitive — returns `[register, execute]` tuples used for lifecycle callbacks: `onInit`, `onResize`, `onBeforeRender`, `onAfterRender`, `onUpdated`.
- **Lazy initialization** — passes accept `gl: WebGL2RenderingContext | undefined` and initialize later via `pass.initialize(gl)`.
- **Proxy-based reactivity** — `setupUniforms` wraps the uniforms object in a `Proxy` to detect mutations and fire `onUpdated` callbacks (the render-on-demand system).
- **Getter properties expose private mutable state**: `get target() { return _target; }`.
- **Composition over inheritance** — complex passes are built by composing simpler ones.
- **No side effects at module load time** — all initialization is deferred to function calls.
