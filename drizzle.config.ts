import { defineConfig } from "drizzle-kit";

console.log("Loading DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING");

export default defineConfig({
  schema: "./app/lib/db/schema.ts",
  out: "./app/supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
