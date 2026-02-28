# Authoring Examples

## Example page anatomy

Every page under `examples/` follows a strict two-file pattern:

```
examples/<category>/<name>/
├── index.md    ← documentation prose + metadata
└── index.ts    ← the runnable code shown in the interactive editor
```

Additional files allowed alongside them:

- `.glsl` / `.frag` / `.vert` — GLSL shaders referenced by `index.ts`
- `.css` — page-specific styles

Do **not** inline GLSL as template literals in `index.ts` when the shader is more than a few lines — use a separate file instead.

## `ExampleEditor.vue`

The `<ExampleEditor>` component in `index.md` renders the interactive code editor and live WebGL preview. It receives the `index.ts` source and any co-located shader/CSS files as props. Do not replicate boilerplate HTML in `index.ts` — the component provides its own scaffold (canvas, imports, etc.).

## Snippets

Reusable HTML and CSS fragments live in `snippets/`. Reference them from example pages rather than duplicating styles. Current snippets:

| Snippet          | Purpose                      |
| ---------------- | ---------------------------- |
| `canvas-full/`   | Full-viewport canvas styles  |
| `canvas-square/` | Square canvas styles         |
| `default/`       | Default HTML wrapper         |
| `render-count/`  | Render count display overlay |
