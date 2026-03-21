import { makeAttachment } from "test/factories/make-attachment";
import { FakeDownloader } from "test/storage/fake-downloader";

import { createEmailAttachmentsFromUrls } from "./create-email-attachment-from-url";

const fakeDownloader = new FakeDownloader();

describe("createEmailAttachmentsFromUrls", () => {
  it("should create email attachments from valid urls", async () => {
    const attachmentsToFetch = [
      makeAttachment({ title: "file-1.zip" }),
      makeAttachment({ title: "file-2.zip" }),
    ];

    const [error, result] = await createEmailAttachmentsFromUrls(
      attachmentsToFetch,
      {
        downloader: fakeDownloader,
      }
    );

    expect(error).toEqual(undefined);

    expect(result).toHaveLength(2);
    expect(result?.[0].filename).toBe("file-1.zip");
    expect(result?.[0].content).toEqual(Buffer.from("file content ok"));
    expect(result?.[1].filename).toBe("file-2.zip");
    expect(result?.[1].content).toEqual(Buffer.from("file content ok"));
  });

  it("should not create email attachments from any invalid URLs", async () => {
    const attachmentsToProcess = [
      makeAttachment({ title: "file-ok.zip" }),
      makeAttachment({
        title: "file-fail.zip",
        url: "http://fake-storage/invalid-file.zip",
      }),
    ];

    const [error] = await createEmailAttachmentsFromUrls(attachmentsToProcess, {
      downloader: fakeDownloader,
    });

    expect(error).toEqual({
      code: "EXTERNAL_SERVICE_FAILED",
      data: {
        details: ["http://fake-storage/invalid-file.zip"],
      },
      message: "Um ou mais anexos falharam ao serem processados.",
    });
  });
});
