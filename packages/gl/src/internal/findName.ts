function findName(source: string | undefined, keyword: string, word: string) {
  const re = new RegExp(`\\b${keyword}\\b\\s+\\w+\\s+(\\w*${word}\\w*)\\b`, "i");
  return source?.match(re)?.[1];
}

/**
 * Finds the name of a uniform variable in a GLSL shader source string.
 *
 * This function searches for a declaration of a uniform variable that contains the specified `word`.
 * It returns the full name of the uniform variable if found.
 *
 * @param source - The GLSL shader source code as a string, or `undefined`.
 * @param word - The substring to look for within the uniform variable's name.
 * @returns The name of the uniform variable, or `undefined` if not found.
 */
export function findUniformName(source: string | undefined, word: string) {
  return findName(source, "uniform", word);
}

/**
 * Finds the name of a varying (or 'in' in GLSL 300 ES) variable in a GLSL shader source string.
 *
 * This function searches for a declaration of a varying or 'in' variable that contains the specified `word`.
 * It returns the full name of the variable if found.
 *
 * @param source - The GLSL shader source code as a string, or `undefined`.
 * @param word - The substring to look for within the varying/in variable's name.
 * @returns The name of the varying/in variable, or `undefined` if not found.
 */
export function findVaryingName(source: string | undefined, word: string) {
  return findName(source, "varying", word) || findName(source, "in", word);
}

/**
 * Finds the name of an attribute (or 'in' in GLSL 300 ES) variable in a GLSL shader source string.
 *
 * This function searches for a declaration of an attribute or 'in' variable that contains the specified `word`.
 * It returns the full name of the variable if found.
 *
 * @param source - The GLSL shader source code as a string, or `undefined`.
 * @param word - The substring to look for within the attribute/in variable's name.
 * @returns The name of the attribute/in variable, or `undefined` if not found.
 */
export function findAttributeName(source: string | undefined, word: string) {
  return findName(source, "attribute", word) || findName(source, "in", word);
}
