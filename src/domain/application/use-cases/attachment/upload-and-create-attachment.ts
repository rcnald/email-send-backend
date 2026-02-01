import { DomainError } from "@/core/domain-error";
import { bad, nice } from "@/core/error";
import { Attachment } from "@/domain/enterprise/entities/attachment";

import type { AttachmentRepository } from "../../repositories/attachment-repository";
import type { Uploader } from "../../storage/uploader";

// TODO: Create an use case for creating an pre signed URL for uploading files
export interface UploadAndCreateAttachmentUseCaseRequest {
  fileName: string;
  fileType: string;
  body: Buffer;
}

export class UploadAndCreateAttachmentUseCase {
  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly uploader: Uploader
  ) {}

  async execute({
    fileName,
    fileType,
    body,
  }: UploadAndCreateAttachmentUseCaseRequest) {
    const isFileTypeValid =
      UploadAndCreateAttachmentUseCase.ZIP_REGEX.test(fileType);

    if (!isFileTypeValid) {
      return bad(
        DomainError.InvalidArgument("Invalid file type", {
          invalidFileType: fileType,
        })
      );
    }

    const [error, result] = await this.uploader.upload({
      fileName,
      fileType,
      body,
    });

    if (error) {
      return bad(error);
    }

    const { url } = result;

    const attachment = Attachment.create({ title: fileName, url });

    this.attachmentRepository.create(attachment);

    return nice({ attachmentId: attachment.id.value });
  }

  private static readonly ZIP_REGEX =
    /^application\/(zip|x-zip-compressed|x-zip)$/;
}
