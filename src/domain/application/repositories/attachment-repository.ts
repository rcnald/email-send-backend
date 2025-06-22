import { Attachment } from "@/domain/enterprise/entities/attachment"

export abstract class AttachmentRepository {
  abstract create(attachment: Attachment): Promise<void>
  abstract find(id: string): Promise<Attachment | null>
}
