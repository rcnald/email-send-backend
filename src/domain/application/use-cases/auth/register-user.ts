import { DomainError } from "@/core/domain-error";
import { bad, nice } from "@/core/error";
import { Helper } from "@/domain/enterprise/entities/helper";
import { Email } from "@/domain/enterprise/entities/value-object/email";

import type { HashGenerator } from "../../cryptography/hash-generator";
import type { HelperRepository } from "../../repositories/helper-repository";

export interface RegisterUserRequest {
  email: string;
  name: string;
  password: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly helperRepository: HelperRepository,
    private readonly hashGenerator: HashGenerator
  ) {}

  async execute({ email, name, password }: RegisterUserRequest) {
    const [emailError, helperEmail] = Email.create(email);

    if (emailError) {
      return bad(
        DomainError.InvalidResource(
          "O Endereço de email fornecido é inválido",
          { email }
        )
      );
    }

    const existingHelper = await this.helperRepository.findByEmail(
      helperEmail.value
    );

    if (existingHelper) {
      return bad(
        DomainError.AlreadyExists("Assistente com este email já existe", {
          email: helperEmail.value,
        })
      );
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    const helper = Helper.create({
      email: helperEmail,
      name,
      password: hashedPassword,
    });

    await this.helperRepository.create(helper);

    return nice({
      helperId: helper.id,
    });
  }
}
