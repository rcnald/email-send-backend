import { EmailAttachment } from "@/domain/application/email/email-sender"

import { AttachmentProps } from "../entities/attachment"

export async function createEmailAttachmentsFromUrls(
  attachments: AttachmentProps[],
): Promise<EmailAttachment[]> {
  const emailAttachments = await Promise.all(
    attachments.map(async (attachment) => {
      try {
        const response = await fetch(attachment.url)

        if (!response.ok) {
          throw new Error()
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        return {
          filename: attachment.title,
          content: buffer,
        }
      } catch {
        return null
      }
    }),
  )

  return emailAttachments.filter((att): att is EmailAttachment => att !== null)
}
