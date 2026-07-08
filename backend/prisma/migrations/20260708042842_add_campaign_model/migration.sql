-- CreateEnum
CREATE TYPE "CampaignMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "CampaignDisplayPages" AS ENUM ('ALL', 'HOME', 'PROGRAMS', 'CONTACT');

-- CreateEnum
CREATE TYPE "CampaignFrequency" AS ENUM ('SESSION', 'DAY', 'VISIT');

-- CreateEnum
CREATE TYPE "CampaignPopupSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'FULLSCREEN');

-- AlterTable
ALTER TABLE "HeroContent" ADD COLUMN     "primaryCtaLink" TEXT NOT NULL DEFAULT '/programs',
ADD COLUMN     "secondaryCtaLink" TEXT NOT NULL DEFAULT '/contact';

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "mediaType" "CampaignMediaType" NOT NULL DEFAULT 'IMAGE',
    "ctaLink" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayPages" "CampaignDisplayPages" NOT NULL DEFAULT 'ALL',
    "frequency" "CampaignFrequency" NOT NULL DEFAULT 'SESSION',
    "popupSize" "CampaignPopupSize" NOT NULL DEFAULT 'MEDIUM',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);
