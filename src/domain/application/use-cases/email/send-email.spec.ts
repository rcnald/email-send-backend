import { makeAttachment } from "test/factories/make-attachment";
import { makeClient } from "test/factories/make-client";
import { makeHelper } from "test/factories/make-helper";
import { makeSendEmailUseCase } from "test/factories/make-send-email-use-case";
import type { InMemoryAttachmentRepository } from "test/in-memory-repositories/in-memory-attachment-repository";
import type { InMemoryClientRepository } from "test/in-memory-repositories/in-memory-client-repository";
import type { InMemoryHelperRepository } from "test/in-memory-repositories/in-memory-helper-repository";
import type { InMemoryMailRepository } from "test/in-memory-repositories/in-memory-mail-repository";
import { generateFileName } from "@/domain/application/utils/file-name-generator";

import type { SendEmailUseCase } from "./send-email";

describe("SentEmailUseCase", () => {
  let inMemoryMailRepository: InMemoryMailRepository;
  let inMemoryClientRepository: InMemoryClientRepository;
  let inMemoryAttachmentRepository: InMemoryAttachmentRepository;
  let inMemoryHelperRepository: InMemoryHelperRepository;
  let sut: SendEmailUseCase;

  beforeEach(() => {
    const setup = makeSendEmailUseCase();

    sut = setup.sendEmailUseCase;
    inMemoryAttachmentRepository = setup.attachmentRepository;
    inMemoryClientRepository = setup.clientRepository;
    inMemoryMailRepository = setup.mailRepository;
    inMemoryHelperRepository = setup.helperRepository;
  });

  it("should send an email with valid data", async () => {
    const helper = makeHelper();
    const client = makeClient({ helperId: helper.id });

    inMemoryClientRepository.create(client);
    inMemoryHelperRepository.create(helper);

    const attachment = makeAttachment();

    inMemoryAttachmentRepository.create(attachment);

    await sut.execute({
      helperId: helper.id.value,
      clientId: client.id.value,
      attachmentIds: [attachment.id.value],
    });

    expect(inMemoryMailRepository.find(client.id.value)).not.toBeNull();
  });

  it("should return error if client does not exist", async () => {
    const helper = makeHelper();

    inMemoryHelperRepository.create(helper);

    const [error, result] = await sut.execute({
      helperId: helper.id.value,
      clientId: "non-existent-client-id",
      attachmentIds: ["attachment-id-1"],
    });

    expect(error).toEqual({
      code: "NOT_FOUND",
      message: "Cliente nao encontrado",
      data: {
        clientId: "non-existent-client-id",
      },
    });
    expect(result).toBeUndefined();
  });

  it("should not proceed with any not found attachments", async () => {
    const helper = makeHelper();
    const client = makeClient({ helperId: helper.id });

    inMemoryClientRepository.create(client);
    inMemoryHelperRepository.create(helper);

    const validAttachment = makeAttachment();

    inMemoryAttachmentRepository.create(validAttachment);

    const [error] = await sut.execute({
      helperId: helper.id.value,
      clientId: client.id.value,
      attachmentIds: [validAttachment.id.value, "invalid-attachment-id"],
    });

    expect(error).toEqual({
      code: "NOT_FOUND",
      data: {
        missingIds: ["invalid-attachment-id"],
      },
      message: "Alguns anexos nao foram encontrados",
    });
  });

  it("should not proceed with any invalid attachments", async () => {
    const helper = makeHelper();
    const client = makeClient({ name: "invalid SA", helperId: helper.id });

    inMemoryClientRepository.create(client);
    inMemoryHelperRepository.create(helper);

    const validAttachment = makeAttachment();
    const invalidAttachment = makeAttachment();

    inMemoryAttachmentRepository.create(validAttachment);
    inMemoryAttachmentRepository.create(invalidAttachment);

    const [error] = await sut.execute({
      helperId: helper.id.value,
      clientId: client.id.value,
      attachmentIds: [validAttachment.id.value, invalidAttachment.id.value],
    });

    const updatedInvalidAttachment =
      inMemoryAttachmentRepository.attachments.find(
        (attachment) => attachment.id.value === invalidAttachment.id.value
      );

    expect(error).toEqual({
      code: "EXTERNAL_SERVICE_FAILED",
      message: "Um ou mais anexos falharam ao serem processados.",
      data: {
        details: [updatedInvalidAttachment?.url],
      },
    });
  });

  it("should rename attachments and update their URLs", async () => {
    const helper = makeHelper();
    const client = makeClient({ name: "rcnald SA", helperId: helper.id });

    inMemoryClientRepository.create(client);
    inMemoryHelperRepository.create(helper);

    const attachment = makeAttachment();

    inMemoryAttachmentRepository.create(attachment);

    await sut.execute({
      helperId: helper.id.value,
      clientId: client.id.value,
      attachmentIds: [attachment.id.value],
    });

    const expectedAttachmentName = generateFileName(
      client.name,
      new Date().getMonth() - 1,
      0
    ).name;

    expect(inMemoryAttachmentRepository.attachments[0]).toEqual(
      expect.objectContaining({
        title: expectedAttachmentName,
      })
    );
  });
});
