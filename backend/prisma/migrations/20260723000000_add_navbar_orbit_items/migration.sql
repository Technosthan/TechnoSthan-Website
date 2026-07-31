-- CreateEnum
CREATE TYPE "NavbarOrbitGroup" AS ENUM ('social', 'theme', 'profile');

-- CreateEnum
CREATE TYPE "NavbarOrbitActionType" AS ENUM ('external_url', 'internal_route', 'theme_mode', 'auth_action');

-- CreateEnum
CREATE TYPE "NavbarOrbitVisibility" AS ENUM ('public', 'guest', 'authenticated', 'user', 'admin');

-- CreateTable
CREATE TABLE "NavbarOrbitItem" (
    "id" TEXT NOT NULL,
    "groupKey" "NavbarOrbitGroup" NOT NULL,
    "actionType" "NavbarOrbitActionType" NOT NULL,
    "systemActionKey" TEXT,
    "label" TEXT NOT NULL,
    "iconKey" TEXT,
    "externalUrl" TEXT,
    "internalPath" TEXT,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "tooltip" TEXT,
    "visibility" "NavbarOrbitVisibility" NOT NULL DEFAULT 'public',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NavbarOrbitItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NavbarOrbitItem_groupKey_systemActionKey_key" ON "NavbarOrbitItem"("groupKey", "systemActionKey");

-- CreateIndex
CREATE INDEX "NavbarOrbitItem_groupKey_isActive_displayOrder_idx" ON "NavbarOrbitItem"("groupKey", "isActive", "displayOrder");

