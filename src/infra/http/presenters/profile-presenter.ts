import type { Helper } from "@/domain/enterprise/entities/helper";

export class ProfilePresenter {
  static toHTTP(helper: Helper) {
    return {
      name: helper.name,
      email: helper.email.value,
    };
  }
}
