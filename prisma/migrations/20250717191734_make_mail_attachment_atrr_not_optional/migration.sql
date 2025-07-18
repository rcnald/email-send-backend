/*
  Warnings:

  - Made the column `html` on table `mails` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "mails" ALTER COLUMN "html" SET NOT NULL;
