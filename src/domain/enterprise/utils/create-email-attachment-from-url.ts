import { bad, nice } from "@/core/error"

import { AttachmentProps } from "../entities/attachment"

// TODO: return to user "failed to fetch attachment 'filename'" if any of the attachments fail to download

export async function createEmailAttachmentsFromUrls(
  attachments: AttachmentProps[],
) {
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
  ).then((attachments) =>
    attachments.filter((attachment) => attachment !== null),
  )

  if (emailAttachments.length === 0) {
    return bad({ code: "ATTACHMENTS_HAS_EXPIRED" })
  }

  return nice(emailAttachments)
}
