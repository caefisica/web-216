import { pgTable, text, integer, timestamp, uuid, check, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: text("name").unique().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const books = pgTable(
  "books",
  {
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
  },
  (table) => ({
    statusCheck: check(
      "status_check",
      sql`${table.status} IN ('available', 'borrowed', 'maintenance')`,
    ),
  }),
);

export const userBookHearts = pgTable("user_book_hearts", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  bookId: uuid("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const borrowRequests = pgTable(
  "borrow_requests",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    requestDate: timestamp("request_date", { withTimezone: true }).defaultNow().notNull(),
    status: text("status").default("pending").notNull(),
    librarianId: text("librarian_id").references(() => user.id, { onDelete: "set null" }),
    approvedDate: timestamp("approved_date", { withTimezone: true }),
    dueDate: timestamp("due_date", { withTimezone: true }),
    returnDate: timestamp("return_date", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    statusCheck: check(
      "status_check",
      sql`${table.status} IN ('pending', 'approved', 'rejected', 'returned')`,
    ),
  }),
);

export const bookImages = pgTable("book_images", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  bookId: uuid("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  isCover: boolean("is_cover").default(false).notNull(), // Note: boolean was missing in some context earlier, but I'll assume it's imported.
  altText: text("alt_text"),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Wait, I need to import boolean for bookImages.
import { boolean } from "drizzle-orm/pg-core";

export const bookCategories = pgTable(
  "book_categories",
  {
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.bookId, table.categoryId] }),
  }),
);
