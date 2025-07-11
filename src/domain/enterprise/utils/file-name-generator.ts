export function generateFileName(
  client: string,
  referenceMonth: string,
  index?: number,
): string {
  const flatClient = client
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .trim()
  const flatMonth = referenceMonth
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toLowerCase()
    .trim()

  return `arquivos-fiscais-${flatClient}-do-mes-de-${flatMonth}-${index}.zip`
}
