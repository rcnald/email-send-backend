import { execSync } from "node:child_process"
import { randomUUID } from "node:crypto"

import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3"
import { PrismaClient } from "@prisma/client"
import { config } from "dotenv"

import { getEnv } from "@/infra/env"
import { createS3Client } from "@/infra/lib/tebi"

config({ path: ".env.test", override: true, quiet: true })

const env = getEnv()

function generateUniqueDatabaseURL(schemaId: string) {
  const databaseURL = new URL(env.DATABASE_URL)

  databaseURL.searchParams.set("schema", schemaId)

  return databaseURL.toString()
}

const schemaId = randomUUID()

const s3Client = createS3Client()
const bucketName = `test-bucket-${schemaId}`

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId)

  process.env.DATABASE_URL = databaseURL
  process.env.S3_BUCKET = bucketName

  try {
    await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }))
  } catch (error) {
    console.error("Failed to create test bucket:", error)
    throw error
  }

  execSync("npx prisma migrate deploy")
})

afterAll(async () => {
  const prisma = new PrismaClient()

  const listedObjects = await s3Client.send(
    new ListObjectsV2Command({ Bucket: bucketName }),
  )

  if (listedObjects.Contents && listedObjects.Contents.length > 0) {
    const objectsToDelete = listedObjects.Contents.map(({ Key }) => ({ Key }))
    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: { Objects: objectsToDelete },
      }),
    )
  }

  await s3Client.send(new DeleteBucketCommand({ Bucket: bucketName }))

  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
