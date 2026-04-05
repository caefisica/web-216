"use server";

import { db } from "@/lib/db";
import { books, categories, bookImages, bookCategories, userBookHearts, borrowRequests } from "@/lib/db/schema";
import { eq, ilike, or, and, sql, desc, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { deleteFile, uploadFile } from "@/lib/s3";

export async function getBooks(filters?: {
  search?: string;
  categoryId?: string;
  status?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const query = db.select({
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
    heartsCount: sql<number>`(SELECT count(*) FROM ${userBookHearts} WHERE ${userBookHearts.bookId} = ${books.id})`.mapWith(Number),
  })
  .from(books);

  const conditions = [];

  if (filters?.search) {
    conditions.push(
      or(
        ilike(books.title, `%${filters.search}%`),
        ilike(books.author, `%${filters.search}%`),
        ilike(books.description, `%${filters.search}%`)
      )
    );
  }

  if (filters?.status && filters.status !== "all") {
    conditions.push(eq(books.status, filters.status));
  }

  if (filters?.categoryId && filters.categoryId !== "all") {
    // For category filtering, we first find the book IDs
    const bookIds = await db
      .select({ bookId: bookCategories.bookId })
      .from(bookCategories)
      .where(eq(bookCategories.categoryId, filters.categoryId));
    
    if (bookIds.length > 0) {
      conditions.push(inArray(books.id, bookIds.map(b => b.bookId)));
    } else {
      return []; // Return empty if no books in category
    }
  }

  if (conditions.length > 0) {
    query.where(and(...conditions));
  }

  const booksData = await query.orderBy(desc(books.createdAt));

  // Fetch images and categories for these books
  const bookIds = booksData.map(b => b.id);
  if (bookIds.length === 0) return [];

  const imagesData = await db
    .select()
    .from(bookImages)
    .where(inArray(bookImages.bookId, bookIds))
    .orderBy(bookImages.displayOrder);

  const categoriesData = await db
    .select({
      bookId: bookCategories.bookId,
      category: categories
    })
    .from(bookCategories)
    .innerJoin(categories, eq(bookCategories.categoryId, categories.id))
    .where(inArray(bookCategories.bookId, bookIds));

  // Determine heart status if user is logged in
  let heartedBookIds: string[] = [];
  if (session?.user) {
    const hearts = await db
      .select({ bookId: userBookHearts.bookId })
      .from(userBookHearts)
      .where(eq(userBookHearts.userId, session.user.id));
    heartedBookIds = hearts.map(h => h.bookId);
  }

  // Merge everything
  return booksData.map(book => {
    const bookImgs = imagesData.filter(img => img.bookId === book.id);
    const bookCats = categoriesData.filter(bc => bc.bookId === book.id).map(bc => bc.category);
    
    return {
      ...book,
      images: bookImgs,
      cover_image: bookImgs.find(img => img.isCover) || bookImgs[0],
      categories: bookCats,
      is_hearted: heartedBookIds.includes(book.id),
      // Map for frontend compatibility
      created_at: book.createdAt,
      updated_at: book.updatedAt,
      image_url: book.imageUrl,
      category_id: book.categoryId,
      publication_year: book.publicationYear,
      hearts_count: book.heartsCount,
    };
  });
}

export async function getBookById(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const booksData = await db.select({
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
    heartsCount: sql<number>`(SELECT count(*) FROM ${userBookHearts} WHERE ${userBookHearts.bookId} = ${books.id})`.mapWith(Number),
  })
  .from(books)
  .where(eq(books.id, id))
  .limit(1);

  if (booksData.length === 0) return null;
  const book = booksData[0];

  const imagesData = await db
    .select()
    .from(bookImages)
    .where(eq(bookImages.bookId, id))
    .orderBy(bookImages.displayOrder);

  const categoriesData = await db
    .select({
      category: categories
    })
    .from(bookCategories)
    .innerJoin(categories, eq(bookCategories.categoryId, categories.id))
    .where(eq(bookCategories.bookId, id));

  let isHearted = false;
  if (session?.user) {
    const heart = await db
      .select()
      .from(userBookHearts)
      .where(and(
        eq(userBookHearts.bookId, id),
        eq(userBookHearts.userId, session.user.id)
      ))
      .limit(1);
    isHearted = heart.length > 0;
  }

  return {
    ...book,
    images: imagesData,
    cover_image: imagesData.find(img => img.isCover) || imagesData[0],
    categories: categoriesData.map(c => c.category),
    is_hearted: isHearted,
    // Compatibility fields
    created_at: book.createdAt,
    updated_at: book.updatedAt,
    image_url: book.imageUrl,
    category_id: book.categoryId,
    publication_year: book.publicationYear,
    hearts_count: book.heartsCount,
  };
}

export async function toggleHeart(bookId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Unauthorized");

  const existing = await db
    .select()
    .from(userBookHearts)
    .where(and(
      eq(userBookHearts.bookId, bookId),
      eq(userBookHearts.userId, session.user.id)
    ))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(userBookHearts).where(and(
      eq(userBookHearts.bookId, bookId),
      eq(userBookHearts.userId, session.user.id)
    ));
    return { hearted: false };
  } else {
    await db.insert(userBookHearts).values({
      bookId,
      userId: session.user.id,
    });
    return { hearted: true };
  }
}

export async function createBorrowRequest(bookId: string, note?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Unauthorized");

  await db.insert(borrowRequests).values({
    id: crypto.randomUUID(),
    bookId,
    userId: session.user.id,
    status: "pending",
    notes: note || null,
  });

  return { success: true };
}

export async function getCategories() {
  return await db.select().from(categories).orderBy(categories.name);
}

export async function uploadImage(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "librarian")) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExt = file.name.split(".").pop();
  const fileName = `book-images/${crypto.randomUUID()}.${fileExt}`;

  await uploadFile(fileName, buffer, file.type);

  // Return the public URL or the key
  // If the bucket is public, we can just return the URL
  // Assuming a public URL structure for now, or you might need a separate getPublicUrl utility
  const publicUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${fileName}`;
  
  return { url: publicUrl, key: fileName };
}

export async function deleteBookImage(imageId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "librarian")) {
    throw new Error("Unauthorized");
  }

  const [image] = await db.select().from(bookImages).where(eq(bookImages.id, imageId)).limit(1);
  if (!image) return;

  // Cleanup from S3/R2
  if (image.imageUrl.includes("book-images")) {
    const key = image.imageUrl.split(`${process.env.S3_BUCKET_NAME}/`).pop();
    if (key) await deleteFile(key);
  }

  await db.delete(bookImages).where(eq(bookImages.id, imageId));
}

export async function updateBookCategories(bookId: string, categoryIds: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "librarian")) {
    throw new Error("Unauthorized");
  }

  await db.transaction(async (tx) => {
    await tx.delete(bookCategories).where(eq(bookCategories.bookId, bookId));
    if (categoryIds.length > 0) {
      await tx.insert(bookCategories).values(
        categoryIds.map(catId => ({
          bookId,
          categoryId: catId,
        }))
      );
    }
  });
}

export async function setBookCoverImage(bookId: string, imageId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "librarian")) {
    throw new Error("Unauthorized");
  }

  await db.transaction(async (tx) => {
    await tx.update(bookImages).set({ isCover: false }).where(eq(bookImages.bookId, bookId));
    await tx.update(bookImages).set({ isCover: true }).where(eq(bookImages.id, imageId));
  });
}

export async function addBookImage(bookId: string, imageUrl: string, isCover: boolean, displayOrder: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "librarian")) {
    throw new Error("Unauthorized");
  }

  await db.insert(bookImages).values({
    id: crypto.randomUUID(),
    bookId,
    imageUrl,
    isCover,
    displayOrder,
  });
}

export async function deleteBook(bookId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "librarian")) {
    throw new Error("Unauthorized");
  }

  // 1. Get images to delete from S3
  const images = await db.select().from(bookImages).where(eq(bookImages.bookId, bookId));
  
  for (const img of images) {
    // Only delete if it's a relative path in our storage
    if (img.imageUrl.includes("book-images") || img.imageUrl.includes("temp/")) {
      const fileName = img.imageUrl.split("/").pop();
      if (fileName) await deleteFile(fileName);
    }
  }

  // 2. Delete book (cascades should handle relations in DB)
  await db.delete(books).where(eq(books.id, bookId));

  revalidatePath("/");
  return { success: true };
}

export async function updateBook(bookId: string, data: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "librarian")) {
    throw new Error("Unauthorized");
  }

  await db.update(books)
    .set({
      title: data.title,
      author: data.author,
      isbn: data.isbn || null,
      publisher: data.publisher || null,
      publicationYear: data.publicationYear ? Number(data.publicationYear) : null,
      pages: data.pages ? Number(data.pages) : null,
      location: data.location || null,
      description: data.description || null,
      status: data.status,
      updatedAt: new Date(),
    })
    .where(eq(books.id, bookId));

  revalidatePath("/");
  return { success: true };
}

export async function createBook(data: any, images: any[], categoriesList: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "librarian")) {
    throw new Error("Unauthorized");
  }

  const bookId = crypto.randomUUID();

  // 1. Create the book
  await db.insert(books).values({
    id: bookId,
    title: data.title,
    author: data.author,
    isbn: data.isbn || null,
    publisher: data.publisher || null,
    publicationYear: data.publicationYear ? Number(data.publicationYear) : null,
    pages: data.pages ? Number(data.pages) : null,
    location: data.location || null,
    description: data.description || null,
    status: data.status || "available",
  });

  // 2. Add images
  if (images && images.length > 0) {
    await db.insert(bookImages).values(
      images.map((img, index) => ({
        id: crypto.randomUUID(),
        bookId: bookId,
        imageUrl: img.url,
        isCover: img.isCover || index === 0,
        displayOrder: index,
      }))
    );
  }

  // 3. Add categories
  if (categoriesList && categoriesList.length > 0) {
    await db.insert(bookCategories).values(
      categoriesList.map(catId => ({
        bookId: bookId,
        categoryId: catId,
      }))
    );
  }

  revalidatePath("/");
  return { success: true, id: bookId };
}

export async function getFavoriteBooks() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return [];
  }

  const heartedBooks = await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      isbn: books.isbn,
      publisher: books.publisher,
      publicationYear: books.publicationYear,
      pages: books.pages,
      description: books.description,
      status: books.status,
      imageUrl: books.imageUrl,
      location: books.location,
      createdAt: books.createdAt,
      updatedAt: books.updatedAt,
      heartsCount: sql<number>`(SELECT count(*) FROM ${userBookHearts} WHERE ${userBookHearts.bookId} = ${books.id})`.mapWith(Number),
    })
    .from(books)
    .innerJoin(userBookHearts, eq(userBookHearts.bookId, books.id))
    .where(eq(userBookHearts.userId, session.user.id))
    .orderBy(desc(userBookHearts.createdAt));

  return heartedBooks.map((book) => ({
    ...book,
    is_hearted: true,
    hearts_count: book.heartsCount,
    publication_year: book.publicationYear,
    image_url: book.imageUrl,
    created_at: book.createdAt,
    updated_at: book.updatedAt,
  }));
}
