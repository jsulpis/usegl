# TypeScript Conventions

## Types

- Prefer **`interface`** for object shapes with public contracts (`RenderPass`, `RenderTarget`).
- Prefer **`type`** for unions, function signatures, and derived types.
- Use **generic constraints** for hook type parameters: `<U extends Uniforms>`, `<O extends string>`.
- Return `as const` tuples from `useHook`: `return [register, execute] as const`.
- Use **`Readonly<T>`** on callback arguments to prevent mutation.
- Use **`Omit<>` / `Partial<>`** for derived option types rather than duplicating shapes.
- Avoid `any` in public API surface — `any` is only acceptable in internal code where generic inference is impractical (e.g. `EffectPass<any>[]`).
- Use **type predicates** (`param is T`) for type narrowing helpers.
- Use `== null` (loose equality) to check both `null` and `undefined`.
