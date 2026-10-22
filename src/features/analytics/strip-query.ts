/**
 * The page address without its query string or #hash. Visitor counts only
 * need the page; a search like /search?q=… could hold something personal.
 */
export function stripQuery(url: string): string {
  const end = url.search(/[?#]/);
  return end === -1 ? url : url.slice(0, end);
}
