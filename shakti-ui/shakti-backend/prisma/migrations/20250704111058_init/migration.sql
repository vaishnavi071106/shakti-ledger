-- CreateTable
CREATE TABLE "vaults" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contract_address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creator_address" TEXT NOT NULL,
    "network" TEXT NOT NULL DEFAULT 'sepolia',
    "tx_hash" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "vault_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wallet_address" TEXT NOT NULL,
    "display_name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vault_id" TEXT NOT NULL,
    CONSTRAINT "vault_members_vault_id_fkey" FOREIGN KEY ("vault_id") REFERENCES "vaults" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "loan_proposals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loan_id" BIGINT NOT NULL,
    "borrower_address" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "purpose" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vault_id" TEXT NOT NULL,
    CONSTRAINT "loan_proposals_vault_id_fkey" FOREIGN KEY ("vault_id") REFERENCES "vaults" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "loan_votes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voter_address" TEXT NOT NULL,
    "vote_type" TEXT NOT NULL,
    "voted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tx_hash" TEXT,
    "proposal_id" TEXT NOT NULL,
    CONSTRAINT "loan_votes_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "loan_proposals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "vaults_contract_address_key" ON "vaults"("contract_address");

-- CreateIndex
CREATE UNIQUE INDEX "vault_members_vault_id_wallet_address_key" ON "vault_members"("vault_id", "wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "loan_proposals_vault_id_loan_id_key" ON "loan_proposals"("vault_id", "loan_id");

-- CreateIndex
CREATE UNIQUE INDEX "loan_votes_proposal_id_voter_address_key" ON "loan_votes"("proposal_id", "voter_address");
