import { Attachment } from "@/domain/enterprise/entities/attachment"

export abstract class AttachmentRepository {
  abstract create(attachment: Attachment): Promise<void>
  abstract find(id: string): Promise<Attachment | null>
  abstract findManyByMultipleIds(ids: string[]): Promise<Attachment[]>
  abstract update(attachment: Attachment): Promise<void>
}
