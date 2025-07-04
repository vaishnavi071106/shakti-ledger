-- CreateTable
CREATE TABLE "loan_repayments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" BIGINT NOT NULL,
    "repaid_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tx_hash" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    CONSTRAINT "loan_repayments_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "loan_proposals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
