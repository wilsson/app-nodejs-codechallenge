/*
  Warnings:

  - You are about to drop the column `transactionId` on the `event_store` table. All the data in the column will be lost.
  - Added the required column `transaction_id` to the `event_store` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."event_store" DROP CONSTRAINT "event_store_transactionId_fkey";

-- AlterTable
ALTER TABLE "event_store" DROP COLUMN "transactionId",
ADD COLUMN     "transaction_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "event_store" ADD CONSTRAINT "event_store_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
