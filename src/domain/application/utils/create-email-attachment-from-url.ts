import { DomainError } from "@/core/domain-error";
import { bad, nice } from "@/core/error";
import type { Downloader } from "@/domain/application/storage/downloader";

import type { AttachmentProps } from "../../enterprise/entities/attachment";

type DownloadError = NonNullable<
  Awaited<ReturnType<Downloader["download"]>>[0]
>;

export async function createEmailAttachmentsFromUrls(
  attachments: AttachmentProps[],
  { downloader }: { downloader: Downloader }
) {
  const emailPromiseResult = await Promise.allSettled(
    attachments.map(async (attachment) => {
      const [error, result] = await downloader.download(attachment.url);

      if (error) {
        throw error;
      }

      return {
        filename: attachment.title,
        content: result.buffer,
        type: "application/zip" as const,
      };
    })
  );

  const successfulAttachments = emailPromiseResult
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

  const failedReasons: DownloadError[] = emailPromiseResult
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason);

  if (successfulAttachments.length === 0) {
    return bad(
      DomainError.ExternalServiceFailed(
        "Attachments have expired or are not accessible"
      )
    );
  }

  if (failedReasons.length > 0) {
    return bad(
      DomainError.ExternalServiceFailed(
        "One or more attachments failed to be processed.",
        {
          details: failedReasons.map(
            (reason) => (reason.data as { file?: string })?.file ?? "unknown"
          ),
        }
      )
    );
  }

  return nice(successfulAttachments);
}
