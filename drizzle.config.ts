import { defineConfig } from "drizzle-kit";

console.log("Loading DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING");

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
