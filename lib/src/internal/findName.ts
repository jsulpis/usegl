function findName(source: string | undefined, keyword: string, word: string) {
  return source
    ?.split("\n")
    .find((line) => new RegExp(`^${keyword}.*${word};`, "i").test(line.trim()))
    ?.match(/(\w+);$/)?.[1];
}

export function findUniformName(source: string | undefined, word: string) {
  return findName(source, "uniform", word);
}

export function findVaryingName(source: string | undefined, word: string) {
  return findName(source, "varying", word) || findName(source, "in", word);
}

export function findAttributeName(source: string | undefined, word: string) {
  return findName(source, "attribute", word) || findName(source, "in", word);
}
