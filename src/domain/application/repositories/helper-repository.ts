import type { Helper } from "@/domain/enterprise/entities/helper";

export abstract class HelperRepository {
  abstract create(helper: Helper): Promise<void>;
  abstract findByEmail(email: string): Promise<Helper | null>;
  abstract findById(id: string): Promise<Helper | null>;
}
