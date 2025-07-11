/**
 * Generate a content object (subject & body) to e-mail.
 *
 * @param data - { clientCNPJ: string, clientName: string, referenceMonth: string }
 * @returns An object within formatted subject, text and html.
 */
export function generateMailContent({
  clientCNPJ,
  clientName,
  referenceMonth,
}: {
  clientName: string
  clientCNPJ: string
  referenceMonth: string
}): {
  subject: string
  html: string
  text: string
} {
  const subject = `Arquivos fiscais de '${clientName}' ('${clientCNPJ}') referente ao mês '${referenceMonth}'`

  const text = `
    Olá,

    Seguem os arquivos fiscais de '${clientName}' (CNPJ: ${clientCNPJ}) referente ao mês '${referenceMonth}'.

    Qualquer dúvida, estamos à disposição.

    --
    Este é um e-mail automático gerado pelo New Support Atendimento.
  `.trim()

  const html = `
    <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
      <p>Olá,</p>
      <p>Seguem os arquivos fiscais de '<strong>${clientName}</strong>' (CNPJ: ${clientCNPJ}) referente ao mês '<strong>${referenceMonth}</strong>'.</p>
      <p>Qualquer dúvida, estamos à disposição.</p>
      <br>
      <p>--</p>
      <p><em>Este é um e-mail automático gerado pelo New Support Atendimento.</em></p>
    </div>
  `.trim()

  return { subject, text, html }
}
