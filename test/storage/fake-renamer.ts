import type { Renamer } from "@/domain/application/storage/renamer";

export class FakeRenamer implements Renamer {
  async rename(): Promise<void> {
    // No-op implementation for testing
  }
}
