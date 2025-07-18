/*
  Warnings:

  - Added the required column `client_name` to the `mails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mails" ADD COLUMN     "client_name" TEXT NOT NULL;
