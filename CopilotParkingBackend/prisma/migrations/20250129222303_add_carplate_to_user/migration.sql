-- AlterTable
ALTER TABLE "User" ADD COLUMN     "carPlate" TEXT,
ADD COLUMN     "userType" TEXT NOT NULL DEFAULT 'default';
