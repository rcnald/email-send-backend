/*
  Warnings:

  - You are about to drop the column `created_at` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `attachments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "created_at",
DROP COLUMN "updated_at";
