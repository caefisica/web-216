import { defineConfig } from "drizzle-kit";

console.log("Loading DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING");

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
