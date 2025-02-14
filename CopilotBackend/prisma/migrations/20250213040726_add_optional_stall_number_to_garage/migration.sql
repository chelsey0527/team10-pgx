-- AlterTable
ALTER TABLE "User" ADD COLUMN     "carColor" TEXT,
ADD COLUMN     "carMake" TEXT,
ADD COLUMN     "carState" TEXT;

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "carPlate" TEXT NOT NULL,
    "carColor" TEXT,
    "carMake" TEXT,
    "carState" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Garage" (
    "id" TEXT NOT NULL,
    "tag" TEXT,
    "color" TEXT,
    "zone" TEXT,
    "stallNumber" TEXT,
    "spots" INTEGER,
    "elevator1" TEXT NOT NULL,
    "elevatorBuilding1" TEXT NOT NULL,
    "weight1" INTEGER NOT NULL,
    "elevator2" TEXT NOT NULL,
    "elevatorBuilding2" TEXT NOT NULL,
    "weight2" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Garage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntranceAndExit" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "color" TEXT,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntranceAndExit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Car_carPlate_key" ON "Car"("carPlate");

-- CreateIndex
CREATE UNIQUE INDEX "Car_userId_key" ON "Car"("userId");

-- CreateIndex
CREATE INDEX "Car_userId_idx" ON "Car"("userId");

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
