-- CreateEnum
CREATE TYPE "transactions_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "account_external_id_debit" TEXT NOT NULL,
    "account_external_id_credit" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "tranfer_type_id" INTEGER NOT NULL,
    "status" "transactions_status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);
