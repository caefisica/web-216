"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { books, bookImages, bookCategories } from "@/lib/db/schema";
import { moveFile, deleteFile, getFileUrl, bucketName, uploadFile } from "@/lib/s3";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq, and, desc } from "drizzle-orm";

export async function uploadBookImage(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `temp/${crypto.randomUUID()}-${file.name}`;

  await uploadFile(fileName, buffer, file.type);
  const url = await getFileUrl(fileName);

  return {
    success: true,
    url: url,
    fileName: fileName,
  };
}

interface MoveImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

interface SaveBookData {
  bookId: string;
  bookData: {
    title: string;
    author: string;
    isbn?: string;
    publisher?: string;
    publication_year?: number;
    pages?: number;
    description?: string;
    status: string;
    location?: string;
    category_id?: string;
  };
  uploadedImages: Array<{
    id: string;
    fileName: string;
    isCover: boolean;
    altText: string;
  }>;
  selectedCategories: string[];
}

export async function moveImageFromTemp(
  tempFileName: string,
  bookId: string,
): Promise<MoveImageResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Generate new permanent file path
    const fileExt = tempFileName.split(".").pop();
    const newFileName = `${bookId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    await moveFile(`temp/${tempFileName}`, newFileName);

    // Construct the URL (S3/R2 usually follows a standard pattern)
    // For R2, it's often https://<ACCOUNT_ID>.r2.cloudflarestorage.com/<BUCKET>/<KEY>
    // but the user might prefer a custom domain. For now, we'll store the key or a generated public URL if the bucket is public.
    const publicUrl = `${process.env.S3_PUBLIC_URL}/${newFileName}`;

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    console.error("Unexpected error moving file:", error);
    return {
      success: false,
      error: "Unexpected error occurred",
    };
  }
}

export async function saveBookWithImages(data: SaveBookData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) throw new Error("Unauthorized");

    const { bookId, bookData, uploadedImages, selectedCategories } = data;

    console.log("Starting save process for book:", bookId);

    // 1. Move uploaded images
    const finalImages: Array<{
      url: string;
      isCover: boolean;
      altText: string;
    }> = [];

    for (const image of uploadedImages) {
      const moveResult = await moveImageFromTemp(image.fileName, bookId);
      if (moveResult.success && moveResult.url) {
        finalImages.push({
          url: moveResult.url,
          isCover: image.isCover,
          altText: image.altText || "",
        });
      }
    }

    // 2. Update book basic information
    await db
      .update(books)
      .set({
        ...bookData,
        updatedAt: new Date(),
      })
      .where(eq(books.id, bookId));

    console.log("Book updated successfully");

    // 3. Insert new images into book_images table
    if (finalImages.length > 0) {
      const existingImagesList = await db
        .select({
          displayOrder: bookImages.displayOrder,
        })
        .from(bookImages)
        .where(eq(bookImages.bookId, bookId))
        .orderBy(desc(bookImages.displayOrder))
        .limit(1);

      const nextDisplayOrder =
        existingImagesList.length > 0 ? (existingImagesList[0].displayOrder || 0) + 1 : 0;

      const imageRecords = finalImages.map((img, index) => ({
        bookId: bookId,
        imageUrl: img.url,
        isCover: img.isCover,
        altText: img.altText || null,
        displayOrder: nextDisplayOrder + index,
      }));

      await db.insert(bookImages).values(imageRecords);
      console.log("Images inserted successfully");
    }

    // 4. Handle multiple categories
    try {
      await db.delete(bookCategories).where(eq(bookCategories.bookId, bookId));

      if (selectedCategories.length > 0) {
        const categoryInserts = selectedCategories.map((categoryId) => ({
          bookId: bookId,
          categoryId: categoryId,
        }));
        await db.insert(bookCategories).values(categoryInserts);
      }
    } catch (categoryError) {
      console.warn("Multiple categories error:", categoryError);
    }

    // 5. Revalidate the page to show updated data
    revalidatePath(`/books/${bookId}`);

    return {
      success: true,
      message: "Libro actualizado correctamente",
      imagesProcessed: finalImages.length,
    };
  } catch (error) {
    console.error("Error saving book:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado",
    };
  }
}

export async function cleanupTempFiles(fileNames: string[]) {
  try {
    for (const fileName of fileNames) {
      await deleteFile(`temp/${fileName}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Unexpected error cleaning up temp files:", error);
    return { success: false };
  }
}

export async function deleteBookImage(imageId: string, bookId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) throw new Error("Unauthorized");

    // Get image info first
    const imageDataList = await db
      .select({
        imageUrl: bookImages.imageUrl,
      })
      .from(bookImages)
      .where(eq(bookImages.id, imageId))
      .limit(1);

    if (imageDataList.length === 0) {
      throw new Error("Image not found");
    }

    const imageData = imageDataList[0];

    // Extract file path from URL (key)
    // URL pattern: https://.../book-id/timestamp_uuid.ext
    const url = new URL(imageData.imageUrl);
    const parts = url.pathname.split("/");
    const key = parts.slice(parts.length - 2).join("/");

    await deleteFile(key);

    // Delete from database
    await db.delete(bookImages).where(eq(bookImages.id, imageId));

    // Revalidate the page
    revalidatePath(`/books/${bookId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado",
    };
  }
}

export async function setCoverImage(imageId: string, bookId: string, isExisting: boolean) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) throw new Error("Unauthorized");

    if (isExisting) {
      await db.update(bookImages).set({ isCover: false }).where(eq(bookImages.bookId, bookId));

      await db.update(bookImages).set({ isCover: true }).where(eq(bookImages.id, imageId));
    }

    revalidatePath(`/books/${bookId}`);
    return { success: true };
  } catch (error) {
    console.error("Error setting cover image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado",
    };
  }
}
