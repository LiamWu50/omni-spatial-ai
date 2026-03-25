import { z } from 'zod'

const envSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4.1-mini'),
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: z.string().optional(),
  NEXT_PUBLIC_TIANDITU_TOKEN: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  POSTGRES_PRISMA_URL: z.string().optional(),
  DUCKDB_PATH: z.string().default('./data/omni.duckdb'),
  NEXTAUTH_SECRET: z.string().optional(),
  APP_URL: z.string().default('http://localhost:3000'),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  PYTHON_ANALYSIS_URL: z.string().optional(),
  GEOCODING_PROVIDER: z.enum(['mapbox', 'tianditu', 'mock']).default('mock'),
  GEOCODING_API_KEY: z.string().optional()
})

export type AppEnv = z.infer<typeof envSchema>

export const env = envSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  NEXT_PUBLIC_TIANDITU_TOKEN: process.env.NEXT_PUBLIC_TIANDITU_TOKEN,
  DATABASE_URL: process.env.DATABASE_URL,
  POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
  DUCKDB_PATH: process.env.DUCKDB_PATH,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  APP_URL: process.env.APP_URL,
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  PYTHON_ANALYSIS_URL: process.env.PYTHON_ANALYSIS_URL,
  GEOCODING_PROVIDER: process.env.GEOCODING_PROVIDER,
  GEOCODING_API_KEY: process.env.GEOCODING_API_KEY
})
