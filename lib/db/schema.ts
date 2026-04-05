import { pgTable, text, integer, timestamp, boolean, uuid, numeric, primaryKey, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// --- BETTER AUTH TABLES ---

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  // Custom Domain Columns
  role: text("role").default("user").notNull(), // 'user', 'librarian', 'admin'
  totalDonations: numeric("total_donations").default("0"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// --- DOMAIN TABLES ---

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: text("name").unique().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn").unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  status: text("status").default("available").notNull(),
  publicationYear: integer("publication_year"),
  publisher: text("publisher"),
  pages: integer("pages"),
  location: text("location"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  statusCheck: check("status_check", sql`${table.status} IN ('available', 'borrowed', 'maintenance')`),
}));

export const userBookHearts = pgTable("user_book_hearts", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  bookId: uuid("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const borrowRequests = pgTable("borrow_requests", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  bookId: uuid("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  requestDate: timestamp("request_date", { withTimezone: true }).defaultNow().notNull(),
  status: text("status").default("pending").notNull(),
  librarianId: text("librarian_id").references(() => user.id, { onDelete: "set null" }),
  approvedDate: timestamp("approved_date", { withTimezone: true }),
  dueDate: timestamp("due_date", { withTimezone: true }),
  returnDate: timestamp("return_date", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  statusCheck: check("status_check", sql`${table.status} IN ('pending', 'approved', 'rejected', 'returned')`),
}));

export const donors = pgTable("donors", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: text("name").notNull(),
  motivation: text("motivation"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const donations = pgTable("donations", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  donorId: uuid("donor_id").notNull().references(() => donors.id, { onDelete: "cascade" }),
  bookTitle: text("book_title").notNull(),
  bookAuthor: text("book_author").notNull(),
  donationDate: timestamp("donation_date", { withTimezone: true }).defaultNow().notNull(),
  status: text("status").default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookImages = pgTable("book_images", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  bookId: uuid("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  isCover: boolean("is_cover").default(false).notNull(),
  altText: text("alt_text"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookCategories = pgTable("book_categories", {
  bookId: uuid("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.bookId, table.categoryId] }),
}));
