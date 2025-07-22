import { bad, nice } from "@/core/error"
import { Downloader } from "@/domain/application/storage/downloader"

import { AttachmentProps } from "../../enterprise/entities/attachment"

type DownloadError = NonNullable<Awaited<ReturnType<Downloader["download"]>>[0]>

export async function createEmailAttachmentsFromUrls(
  attachments: AttachmentProps[],
  { downloader }: { downloader: Downloader },
) {
  const emailPromiseResult = await Promise.allSettled(
    attachments.map(async (attachment) => {
      const [error, result] = await downloader.download(attachment.url)

      if (error) {
        throw error
      }

      return {
        filename: attachment.title,
        content: result.buffer,
        type: "application/zip" as const,
      }
    }),
  )

  const successfulAttachments = emailPromiseResult
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value)

  const failedReasons: DownloadError[] = emailPromiseResult
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason)

  if (successfulAttachments.length === 0) {
    return bad({
      code: "ATTACHMENTS_HAS_EXPIRED",
      message: "Attachments have expired or are not accessible",
    })
  }

  if (failedReasons.length > 0) {
    return bad({
      code: "ATTACHMENT_PROCESSING_ERROR",
      message: "One or more attachments failed to be processed.",
      data: {
        details: failedReasons.map((reason) => reason.file),
      },
    })
  }

  return nice(successfulAttachments)
}
