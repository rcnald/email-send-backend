-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_mail_id_fkey";

-- AlterTable
ALTER TABLE "attachments" ALTER COLUMN "mail_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_mail_id_fkey" FOREIGN KEY ("mail_id") REFERENCES "mails"("id") ON DELETE SET NULL ON UPDATE CASCADE;
