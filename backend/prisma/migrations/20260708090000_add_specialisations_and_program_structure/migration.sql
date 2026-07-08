-- Create enums
CREATE TYPE "ProgramType" AS ENUM (
    'FOUNDATION_PROGRAM',
    'CAREER_ACCELERATOR',
    'SKILL_DEVELOPMENT_PROGRAM',
    'PROFESSIONAL_CERTIFICATION',
    'INDUSTRY_READINESS_PROGRAM',
    'APPRENTICESHIP_PROGRAM',
    'BOOTCAMP',
    'WORKSHOP',
    'MASTERCLASS',
    'INNOVATION_CHALLENGE',
    'RESEARCH_FELLOWSHIP',
    'FDP',
    'TTT',
    'CORPORATE_LEARNING_PROGRAM',
    'INTERNSHIP_PROGRAM',
    'CAPSTONE_PROJECT'
);

CREATE TYPE "CertificationLevel" AS ENUM (
    'EXPLORER',
    'FOUNDATION',
    'PRACTITIONER',
    'PROFESSIONAL',
    'SPECIALIST',
    'EXPERT',
    'MASTER',
    'FELLOW',
    'MENTOR'
);

-- Create table
CREATE TABLE "Specialisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "iconUrl" TEXT,
    "bannerImageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Specialisation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Specialisation_slug_key" ON "Specialisation"("slug");

-- Alter table
ALTER TABLE "Program"
ADD COLUMN     "specialisationId" TEXT,
ADD COLUMN     "programType" "ProgramType",
ADD COLUMN     "certificationLevel" "CertificationLevel",
ADD COLUMN     "showOnHome" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Program_specialisationId_idx" ON "Program"("specialisationId");
CREATE INDEX "Program_programType_idx" ON "Program"("programType");
CREATE INDEX "Program_certificationLevel_idx" ON "Program"("certificationLevel");
CREATE INDEX "Program_showOnHome_idx" ON "Program"("showOnHome");

ALTER TABLE "Program"
ADD CONSTRAINT "Program_specialisationId_fkey"
FOREIGN KEY ("specialisationId") REFERENCES "Specialisation"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default specialisations
INSERT INTO "Specialisation" ("id", "name", "slug", "shortDescription", "description", "sortOrder")
VALUES
  ('specialisation_techno', 'Techno', 'techno', 'Technology and digital innovation programs.', 'Technology, software, AI, data, cybersecurity, robotics, IoT, cloud, and digital skills programs.', 1),
  ('specialisation_agrosthan', 'AgroSthan', 'agrosthan', 'Agritech and rural innovation programs.', 'Agritech, smart farming, food processing, dairy technology, farm automation, and rural innovation programs.', 2)
ON CONFLICT ("slug") DO NOTHING;

