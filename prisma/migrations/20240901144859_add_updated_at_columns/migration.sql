/*
  Warnings:

  - You are about to drop the column `updateddAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `updateddAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCost` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_productId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "updateddAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "amount",
DROP COLUMN "productId",
ADD COLUMN     "totalCost" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "updateddAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ProductPurchase" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "ProductPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductPurchase_id_key" ON "ProductPurchase"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPurchase_productId_purchaseId_key" ON "ProductPurchase"("productId", "purchaseId");

-- AddForeignKey
ALTER TABLE "ProductPurchase" ADD CONSTRAINT "ProductPurchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPurchase" ADD CONSTRAINT "ProductPurchase_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
