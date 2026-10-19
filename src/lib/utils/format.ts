/** "1 guide", "3 guides". English only for now; i18n replaces this later. */
export function countLabel(
  count: number,
  singular: string,
  plural = `${singular}s`,
) {
  return `${count} ${count === 1 ? singular : plural}`;
}
