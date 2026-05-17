"use server";

import { getDb } from "@/lib/db";
import {
  books,
  categories,
  bookImages,
  bookCategories,
  userBookHearts,
  borrowRequests,
} from "@/lib/db/schema";
import { eq, ilike, or, and, sql, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { deleteFile, uploadFile } from "@/lib/storage";
import { z } from "zod";
import { authenticatedAction, protectedAction, getSession } from "@/lib/protected-action";
import { BookIdSchema, SearchSchema, UpdateBookSchema, CreateBookSchema } from "./schemas";
import { Ok, Err } from "@/lib/result";

/**
 * Fetches books with optional filters.
 * Publicly accessible but returns user-specific 'isHearted' status if logged in.
 */
export async function getBooks(filters?: z.infer<typeof SearchSchema>) {
  const db = await getDb();
  const session = await getSession();
  const parsedFilters = SearchSchema.parse(filters || {});

  const query = db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      isbn: books.isbn,
      description: books.description,
      imageUrl: books.imageUrl,
      categoryId: books.categoryId,
      status: books.status,
      publicationYear: books.publicationYear,
      publisher: books.publisher,
      pages: books.pages,
      location: books.location,
      createdAt: books.createdAt,
      updatedAt: books.updatedAt,
      heartsCount:
        sql<number>`(SELECT count(*) FROM ${userBookHearts} WHERE ${userBookHearts.bookId} = ${books.id})`.mapWith(
          Number,
        ),
    })
    .from(books);

  const conditions = [];

  if (parsedFilters.search) {
    conditions.push(
      or(
        ilike(books.title, `%${parsedFilters.search}%`),
        ilike(books.author, `%${parsedFilters.search}%`),
        ilike(books.description, `%${parsedFilters.search}%`),
      ),
    );
  }

  if (parsedFilters.status && parsedFilters.status !== "all") {
    conditions.push(eq(books.status, parsedFilters.status));
  }

  if (parsedFilters.categoryId && parsedFilters.categoryId !== "all") {
    conditions.push(eq(books.categoryId, parsedFilters.categoryId));
  }

  if (conditions.length > 0) {
    query.where(and(...conditions));
  }

  const booksData = await query.orderBy(desc(books.createdAt));

  const bookIds = booksData.map((b) => b.id);
  if (bookIds.length === 0) return [];

  const imagesData = await db
    .select()
    .from(bookImages)
    .where(inArray(bookImages.bookId, bookIds))
    .orderBy(bookImages.displayOrder);

  const categoriesData = await db
    .select({
      bookId: bookCategories.bookId,
      category: categories,
    })
    .from(bookCategories)
    .innerJoin(categories, eq(bookCategories.categoryId, categories.id))
    .where(inArray(bookCategories.bookId, bookIds));

  let heartedBookIds: string[] = [];
  if (session.user) {
    const hearts = await db
      .select({ bookId: userBookHearts.bookId })
      .from(userBookHearts)
      .where(eq(userBookHearts.userId, session.user.id));
    heartedBookIds = hearts.map((h) => h.bookId);
  }

  return booksData.map((book) => {
    const bookImgs = imagesData.filter((img) => img.bookId === book.id);
    const bookCats = categoriesData.filter((bc) => bc.bookId === book.id).map((bc) => bc.category);

    return {
      ...book,
      images: bookImgs,
      coverImage: bookImgs.find((img) => img.isCover) || bookImgs[0],
      categories: bookCats,
      isHearted: heartedBookIds.includes(book.id),
    };
  });
}

export async function getFavoriteBooks() {
  const db = await getDb();
  const session = await getSession();
  if (!session.user) return [];

  const hearts = await db
    .select({ bookId: userBookHearts.bookId })
    .from(userBookHearts)
    .where(eq(userBookHearts.userId, session.user.id));

  if (hearts.length === 0) return [];

  const bookIds = hearts.map((h) => h.bookId);

  const booksData = await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      isbn: books.isbn,
      description: books.description,
      imageUrl: books.imageUrl,
      categoryId: books.categoryId,
      status: books.status,
      publicationYear: books.publicationYear,
      publisher: books.publisher,
      pages: books.pages,
      location: books.location,
      createdAt: books.createdAt,
      updatedAt: books.updatedAt,
      heartsCount:
        sql<number>`(SELECT count(*) FROM ${userBookHearts} WHERE ${userBookHearts.bookId} = ${books.id})`.mapWith(
          Number,
        ),
    })
    .from(books)
    .where(inArray(books.id, bookIds))
    .orderBy(desc(books.createdAt));

  const imagesData = await db
    .select()
    .from(bookImages)
    .where(inArray(bookImages.bookId, bookIds))
    .orderBy(bookImages.displayOrder);

  const categoriesData = await db
    .select({
      bookId: bookCategories.bookId,
      category: categories,
    })
    .from(bookCategories)
    .innerJoin(categories, eq(bookCategories.categoryId, categories.id))
    .where(inArray(bookCategories.bookId, bookIds));

  return booksData.map((book) => {
    const bookImgs = imagesData.filter((img) => img.bookId === book.id);
    const bookCats = categoriesData.filter((bc) => bc.bookId === book.id).map((bc) => bc.category);

    return {
      ...book,
      images: bookImgs,
      coverImage: bookImgs.find((img) => img.isCover) || bookImgs[0],
      categories: bookCats,
      isHearted: true,
    };
  });
}

export async function getBookById(id: string) {
  const db = await getDb();
  const session = await getSession();

  const booksData = await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      isbn: books.isbn,
      description: books.description,
      imageUrl: books.imageUrl,
      categoryId: books.categoryId,
      status: books.status,
      publicationYear: books.publicationYear,
      publisher: books.publisher,
      pages: books.pages,
      location: books.location,
      createdAt: books.createdAt,
      updatedAt: books.updatedAt,
      heartsCount:
        sql<number>`(SELECT count(*) FROM ${userBookHearts} WHERE ${userBookHearts.bookId} = ${books.id})`.mapWith(
          Number,
        ),
    })
    .from(books)
    .where(eq(books.id, id))
    .limit(1);

  if (booksData.length === 0) return Err("not_found");
  const book = booksData[0];

  const imagesData = await db
    .select()
    .from(bookImages)
    .where(eq(bookImages.bookId, id))
    .orderBy(bookImages.displayOrder);

  const categoriesData = await db
    .select({
      category: categories,
    })
    .from(bookCategories)
    .innerJoin(categories, eq(bookCategories.categoryId, categories.id))
    .where(eq(bookCategories.bookId, id));

  let isHearted = false;
  if (session.user) {
    const heart = await db
      .select()
      .from(userBookHearts)
      .where(and(eq(userBookHearts.bookId, id), eq(userBookHearts.userId, session.user.id)))
      .limit(1);
    isHearted = heart.length > 0;
  }

  return Ok({
    ...book,
    images: imagesData,
    coverImage: imagesData.find((img) => img.isCover) || imagesData[0],
    categories: categoriesData.map((c) => c.category),
    isHearted,
  });
}

export const toggleHeart = authenticatedAction(BookIdSchema, async ({ bookId }, session) => {
  const db = await getDb();
  const existing = await db
    .select()
    .from(userBookHearts)
    .where(and(eq(userBookHearts.bookId, bookId), eq(userBookHearts.userId, session.user.id)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(userBookHearts)
      .where(and(eq(userBookHearts.bookId, bookId), eq(userBookHearts.userId, session.user.id)));
    return { hearted: false };
  } else {
    await db.insert(userBookHearts).values({
      bookId,
      userId: session.user.id,
    });
    return { hearted: true };
  }
});

export const createBorrowRequest = authenticatedAction(
  z.object({ bookId: z.uuid(), note: z.string().optional() }),
  async ({ bookId, note }, session) => {
    const db = await getDb();
    await db.insert(borrowRequests).values({
      id: crypto.randomUUID(),
      bookId,
      userId: session.user.id,
      status: "pending",
      notes: note || null,
    });

    return { success: true };
  },
);

export async function getCategories() {
  const db = await getDb();
  return await db.select().from(categories).orderBy(categories.name);
}

export const uploadBookImage = protectedAction(
  z.instanceof(FormData),
  ["librarian", "admin"],
  async (formData) => {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `book-images/${crypto.randomUUID()}-${file.name}`;
    await uploadFile(fileName, buffer, file.type);

    const publicUrl = `${process.env.S3_PUBLIC_URL}/${fileName}`;
    return { url: publicUrl };
  },
);

export const deleteBookImage = protectedAction(
  z.object({ imageId: z.uuid(), bookId: z.uuid() }),
  ["librarian", "admin"],
  async ({ imageId }) => {
    const db = await getDb();
    const [img] = await db.select().from(bookImages).where(eq(bookImages.id, imageId)).limit(1);

    if (img && img.imageUrl.includes("book-images")) {
      const fileName = img.imageUrl.split("/").pop();
      if (fileName) {
        try {
          await deleteFile(`book-images/${fileName}`);
        } catch (error) {
          console.error("Error deleting file from S3:", error);
        }
      }
    }

    await db.delete(bookImages).where(eq(bookImages.id, imageId));
    return { success: true };
  },
);

export const setCoverImage = protectedAction(
  z.object({ imageId: z.uuid(), bookId: z.uuid(), isExisting: z.boolean() }),
  ["librarian", "admin"],
  async ({ imageId, bookId }) => {
    const db = await getDb();
    await db.update(bookImages).set({ isCover: false }).where(eq(bookImages.bookId, bookId));
    await db.update(bookImages).set({ isCover: true }).where(eq(bookImages.id, imageId));

    // Also update the main book imageUrl for redundancy/performance
    const [img] = await db.select().from(bookImages).where(eq(bookImages.id, imageId)).limit(1);
    if (img) {
      await db.update(books).set({ imageUrl: img.imageUrl }).where(eq(books.id, bookId));
    }

    revalidatePath(`/books/${bookId}`);
    return { success: true };
  },
);

export const addBookImage = protectedAction(
  z.object({
    bookId: z.uuid(),
    imageUrl: z.url(),
    isCover: z.boolean(),
    displayOrder: z.number(),
  }),
  ["librarian", "admin"],
  async ({ bookId, imageUrl, isCover, displayOrder }) => {
    const db = await getDb();
    if (isCover) {
      await db.update(bookImages).set({ isCover: false }).where(eq(bookImages.bookId, bookId));
      await db.update(books).set({ imageUrl }).where(eq(books.id, bookId));
    }

    await db.insert(bookImages).values({
      id: crypto.randomUUID(),
      bookId,
      imageUrl,
      isCover,
      displayOrder,
    });

    revalidatePath(`/books/${bookId}`);
    return { success: true };
  },
);

// ADMINISTRATIVE ACTIONS

export const deleteBook = protectedAction(
  BookIdSchema,
  ["librarian", "admin"],
  async ({ bookId }) => {
    const db = await getDb();
    const images = await db.select().from(bookImages).where(eq(bookImages.bookId, bookId));

    for (const img of images) {
      if (img.imageUrl.includes("book-images")) {
        const fileName = img.imageUrl.split("/").pop();
        if (fileName) await deleteFile(fileName);
      }
    }

    await db.delete(books).where(eq(books.id, bookId));
    revalidatePath("/");
    return { success: true };
  },
);

export const updateBook = protectedAction(
  UpdateBookSchema,
  ["librarian", "admin"],
  async (data) => {
    const db = await getDb();
    await db
      .update(books)
      .set({
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        publisher: data.publisher,
        publicationYear: data.publicationYear,
        pages: data.pages,
        location: data.location,
        description: data.description,
        status: data.status,
        categoryId: data.categoryId,
        updatedAt: new Date(),
      })
      .where(eq(books.id, data.id));

    revalidatePath(`/books/${data.id}`);
    revalidatePath("/");
    return { success: true };
  },
);

export const createBook = protectedAction(
  CreateBookSchema,
  ["librarian", "admin"],
  async (data) => {
    const db = await getDb();
    const bookId = crypto.randomUUID();

    await db.insert(books).values({
      id: bookId,
      title: data.title,
      author: data.author,
      isbn: data.isbn || null,
      publisher: data.publisher || null,
      publicationYear: data.publicationYear,
      pages: data.pages,
      location: data.location || null,
      description: data.description || null,
      status: data.status || "available",
      categoryId: data.categoryId || null,
    });

    revalidatePath("/");
    return { success: true, id: bookId };
  },
);
