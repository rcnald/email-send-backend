import { bad, nice } from "@/core/error"
import { EmailAttachment } from "@/domain/application/email/email-sender"
import { Downloader } from "@/domain/application/storage/downloader"

import { AttachmentProps } from "../entities/attachment"

// TODO: return to user "failed to fetch attachment 'filename'" if any of the attachments fail to download

export async function createEmailAttachmentsFromUrls(
  attachments: AttachmentProps[],
  { downloader }: { downloader: Downloader },
) {
  const emailAttachments: EmailAttachment[] = (
    await Promise.all(
      attachments.map(async (attachment) => {
        try {
          const { buffer } = await downloader.download(attachment.url)

          return {
            filename: attachment.title,
            content: buffer,
            type: "application/zip" as const,
          }
        } catch {
          return null
        }
      }),
    )
  ).filter((attachment): attachment is EmailAttachment => attachment !== null)

  if (emailAttachments.length === 0) {
    return bad({
      code: "ATTACHMENTS_HAS_EXPIRED",
      message: "Attachments have expired or are not accessible",
    })
  }

  return nice(emailAttachments)
}
