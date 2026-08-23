-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "isOnline" BOOLEAN,
ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "url" TEXT;
