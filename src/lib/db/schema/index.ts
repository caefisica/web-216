import { pgTable, text } from "drizzle-orm/pg-core";
import { user, session, emailVerificationRequest, passwordResetSession, Role } from "./auth";
import {
  categories,
  books,
  userBookHearts,
  borrowRequests,
  bookImages,
  bookCategories,
} from "./library";
import { donors, donations } from "./donations";

export {
  user,
  session,
  emailVerificationRequest,
  passwordResetSession,
  Role,
  categories,
  books,
  userBookHearts,
  borrowRequests,
  bookImages,
  bookCategories,
  donors,
  donations,
};

export const schemaIntegrity = pgTable("schema_integrity", {
  id: text("id").primaryKey().default("integrity"),
  schemaHash: text("schema_hash").notNull(),
  seedHash: text("seed_hash").notNull(),
});
