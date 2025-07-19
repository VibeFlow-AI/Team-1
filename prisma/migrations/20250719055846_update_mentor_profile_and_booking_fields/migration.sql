/*
  Warnings:

  - Added the required column `currentLocation` to the `mentor_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `mentor_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linkedinProfile` to the `mentor_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferredLanguage` to the `mentor_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferredLevels` to the `mentor_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `professionalRole` to the `mentor_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortBio` to the `mentor_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjects` to the `mentor_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teachingExperience` to the `mentor_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "bookedDate" TEXT,
ADD COLUMN     "bookedTime" TEXT;

-- AlterTable
ALTER TABLE "mentor_profiles" ADD COLUMN     "currentLocation" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "githubPortfolio" TEXT,
ADD COLUMN     "linkedinProfile" TEXT,
ADD COLUMN     "preferredLanguage" TEXT,
ADD COLUMN     "preferredLevels" JSONB,
ADD COLUMN     "professionalRole" TEXT,
ADD COLUMN     "profilePictureUrl" TEXT,
ADD COLUMN     "shortBio" TEXT,
ADD COLUMN     "subjects" JSONB,
ADD COLUMN     "teachingExperience" TEXT,
ALTER COLUMN "expertise" DROP NOT NULL,
ALTER COLUMN "experience" DROP NOT NULL,
ALTER COLUMN "bio" DROP NOT NULL,
ALTER COLUMN "hourlyRate" DROP NOT NULL;

-- Update existing mentor profiles with default values
UPDATE "mentor_profiles" SET 
  "currentLocation" = 'Not specified',
  "email" = 'mentor@example.com',
  "linkedinProfile" = 'https://linkedin.com/in/placeholder',
  "preferredLanguage" = 'English',
  "preferredLevels" = '["Grade 6-9", "Grade 10-11"]',
  "professionalRole" = 'Teacher',
  "shortBio" = 'Experienced educator with a passion for teaching.',
  "subjects" = '["Mathematics", "Science"]',
  "teachingExperience" = '3–5 years';

-- Make the columns NOT NULL after updating with default values
ALTER TABLE "mentor_profiles" ALTER COLUMN "currentLocation" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "linkedinProfile" SET NOT NULL,
ALTER COLUMN "preferredLanguage" SET NOT NULL,
ALTER COLUMN "preferredLevels" SET NOT NULL,
ALTER COLUMN "professionalRole" SET NOT NULL,
ALTER COLUMN "shortBio" SET NOT NULL,
ALTER COLUMN "subjects" SET NOT NULL,
ALTER COLUMN "teachingExperience" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "hasProfile" BOOLEAN NOT NULL DEFAULT false;
