import { randomUUID } from "node:crypto"

export function generateFileName(
  client: string,
  referenceMonth: number,
  index?: number,
): { name: string; url: string } {
  const monthBRL = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
  }).format(new Date().setMonth(referenceMonth))

  const flatClient = client
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .trim()
  const flatMonth = monthBRL
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toLowerCase()
    .trim()

  const uuid = randomUUID()

  return {
    name: `arquivos-fiscais-${flatClient}-do-mes-de-${flatMonth}-${index}.zip`,
    url: `arquivos-fiscais-${flatClient}-do-mes-de-${flatMonth}-${index}-${uuid}.zip`,
  }
}
