/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - The primary key for the `UserRoundScore` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `UserRoundScore` table. All the data in the column will be lost.
  - Added the required column `username` to the `UserRoundScore` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserRoundScore" DROP CONSTRAINT "UserRoundScore_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("username");

-- AlterTable
ALTER TABLE "UserRoundScore" DROP CONSTRAINT "UserRoundScore_pkey",
DROP COLUMN "userId",
ADD COLUMN     "username" TEXT NOT NULL,
ADD CONSTRAINT "UserRoundScore_pkey" PRIMARY KEY ("username", "roundId");

-- AddForeignKey
ALTER TABLE "UserRoundScore" ADD CONSTRAINT "UserRoundScore_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
