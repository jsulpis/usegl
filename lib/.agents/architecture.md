# Architecture & Conventions

## Directory Structure (`lib/src/`)

```
src/
├── index.ts          ← public API barrel export (only file that re-exports)
├── types.ts          ← all shared TypeScript types and interfaces
├── core/             ← low-level WebGL2 primitives (program, shader, buffer, texture…)
├── hooks/            ← public high-level hook API (use*.ts files)
├── internal/         ← private implementation helpers (not exported from index.ts)
└── effects/          ← built-in post-processing effects (bloom, trails, toneMapping)
```

- New public hooks → `hooks/`, new internals → `internal/`, new effects → `effects/`.
- `types.ts` is the single source of truth for shared types — avoid defining shared types inline.
- `index.ts` is the only barrel; do not create barrel files within subdirectories.

## Naming Conventions

| Kind | Convention | Example |
|------|-----------|---------|
| Hook / factory functions | `camelCase` | `useRenderPass`, `createProgram` |
| Types / Interfaces | `PascalCase` | `RenderPass<U>`, `TextureParams` |
| Private closure variables | `_camelCase` (underscore prefix) | `_gl`, `_program`, `_target` |
| Module-level constants | `camelCase` for objects/arrays | `quadVertexPositions` |
| GL enum-like constants | `SCREAMING_SNAKE_CASE` | `UNSIGNED_INT` |
| GLSL uniforms | `u` prefix | `uTexelSize`, `uMix`, `uBloomTexture` |
| GLSL attributes | `a` prefix | `aPosition` |
| GLSL varyings | `v` prefix | `vUv` |
| Effect factory functions | `camelCase` | `bloom()`, `trails()` |
| Hook files | `use<PascalCase>.ts` | `useRenderPass.ts` |
| Core utility files | `<noun>.ts` | `program.ts`, `texture.ts` |

## Architecture Patterns

- **Closure-based hooks** — no classes. Every `use*` function closes over private mutable state (prefixed `_`) and returns a plain object API with getter properties.
- **`useHook<C>()`** is the internal pub/sub primitive — returns `[register, execute]` tuples used for lifecycle callbacks: `onInit`, `onResize`, `onBeforeRender`, `onAfterRender`, `onUpdated`.
- **Lazy initialization** — passes accept `gl: WebGL2RenderingContext | undefined` and initialize later via `pass.initialize(gl)`.
- **Proxy-based reactivity** — `useUniforms` wraps the uniforms object in a `Proxy` to detect mutations and fire `onUpdated` callbacks (the render-on-demand system).
- **Getter properties** expose private mutable state: `get target() { return _target; }`.
- **Composition over inheritance** — complex passes are built by composing simpler ones.
- **No side effects at module load time** — all initialization is deferred to function calls.
