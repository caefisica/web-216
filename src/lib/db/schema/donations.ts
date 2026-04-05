import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const donors = pgTable("donors", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: text("name").notNull(),
  motivation: text("motivation"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const donations = pgTable("donations", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  donorId: uuid("donor_id")
    .notNull()
    .references(() => donors.id, { onDelete: "cascade" }),
  bookTitle: text("book_title").notNull(),
  bookAuthor: text("book_author").notNull(),
  donationDate: timestamp("donation_date", { withTimezone: true }).defaultNow().notNull(),
  status: text("status").default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
