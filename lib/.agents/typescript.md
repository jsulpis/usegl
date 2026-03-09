# TypeScript Conventions

## File organization

- always start with the main (highest-level) function of the file.
- write functions in decreasing order of abstraction (main function calls helper functions defined below).
- write the types and interfaces at the end of the file, after all the implementation code.
- don't write JSDoc comments for private/internal functions — only document the public API surface.

## Types

- Prefer **`interface`** for object shapes with public contracts (`RenderPass`, `RenderTarget`).
- Prefer **`type`** for unions, function signatures, and derived types.
- Use **`Readonly<T>`** on callback arguments to prevent mutation.
- Use **`Omit<>` / `Partial<>`** for derived option types rather than duplicating shapes.
- Avoid `any` in public API surface — `any` is only acceptable in internal code where generic inference is impractical (e.g. `EffectPass<any>[]`).
- Use **type predicates** (`param is T`) for type narrowing helpers.
- Use `== null` (loose equality) to check both `null` and `undefined`.
