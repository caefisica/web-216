"use server";

import { createServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

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
    const supabase = createServerClient();

    // Generate new permanent file path
    const fileExt = tempFileName.split(".").pop();
    const newFileName = `${bookId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Move file from temp to permanent location
    const { data, error } = await supabase.storage
      .from("book-images")
      .move(`temp/${tempFileName}`, newFileName);

    if (error) {
      console.error("Error moving file:", error);
      return { success: false, error: error.message };
    }

    // Get public URL for the new location
    const { data: publicUrlData } = supabase.storage
      .from("book-images")
      .getPublicUrl(newFileName);

    return {
      success: true,
      url: publicUrlData.publicUrl,
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
    const supabase = createServerClient();
    const { bookId, bookData, uploadedImages, selectedCategories } = data;

    console.log("Starting save process for book:", bookId);
    console.log("Uploaded images:", uploadedImages.length);

    // 1. Move uploaded images from temp to permanent storage
    const finalImages: Array<{
      url: string;
      isCover: boolean;
      altText: string;
    }> = [];

    for (const image of uploadedImages) {
      console.log("Processing image:", image.fileName);
      const moveResult = await moveImageFromTemp(image.fileName, bookId);

      if (moveResult.success && moveResult.url) {
        finalImages.push({
          url: moveResult.url,
          isCover: image.isCover,
          altText: image.altText || "",
        });
        console.log("Successfully moved image:", image.fileName);
      } else {
        console.error(
          `Failed to move image ${image.fileName}:`,
          moveResult.error,
        );
        // Continue with other images even if one fails
      }
    }

    console.log("Final images to save:", finalImages.length);

    // 2. Update book basic information
    const { error: updateError } = await supabase
      .from("books")
      .update({
        ...bookData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookId);

    if (updateError) {
      console.error("Error updating book:", updateError);
      throw new Error(`Failed to update book: ${updateError.message}`);
    }

    console.log("Book updated successfully");

    // 3. Insert new images into book_images table
    if (finalImages.length > 0) {
      // Get current image count for display_order
      const { data: existingImages } = await supabase
        .from("book_images")
        .select("display_order")
        .eq("book_id", bookId)
        .order("display_order", { ascending: false })
        .limit(1);

      const nextDisplayOrder =
        existingImages && existingImages.length > 0
          ? (existingImages[0].display_order || 0) + 1
          : 0;

      const imageRecords = finalImages.map((img, index) => ({
        book_id: bookId,
        image_url: img.url,
        is_cover: img.isCover,
        alt_text: img.altText || null,
        display_order: nextDisplayOrder + index,
      }));

      console.log("Inserting image records:", imageRecords);

      const { error: insertImagesError, data: insertedImages } = await supabase
        .from("book_images")
        .insert(imageRecords)
        .select();

      if (insertImagesError) {
        console.error("Error inserting image records:", insertImagesError);
        throw new Error(
          `Failed to insert image records: ${insertImagesError.message}`,
        );
      }

      console.log("Images inserted successfully:", insertedImages?.length || 0);
    }

    // 4. Handle multiple categories
    try {
      // First, delete existing category associations
      const { error: deleteError } = await supabase
        .from("book_categories")
        .delete()
        .eq("book_id", bookId);

      if (deleteError) {
        console.warn("Error deleting existing categories:", deleteError);
      }

      // Then, insert new category associations
      if (selectedCategories.length > 0) {
        const categoryInserts = selectedCategories.map((categoryId) => ({
          book_id: bookId,
          category_id: categoryId,
        }));

        const { error: categoryError } = await supabase
          .from("book_categories")
          .insert(categoryInserts);

        if (categoryError) {
          console.warn("Could not update multiple categories:", categoryError);
        } else {
          console.log("Categories updated successfully");
        }
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
    const supabase = createServerClient();

    const filePaths = fileNames.map((fileName) => `temp/${fileName}`);

    const { error } = await supabase.storage
      .from("book-images")
      .remove(filePaths);

    if (error) {
      console.error("Error cleaning up temp files:", error);
    }

    return { success: !error };
  } catch (error) {
    console.error("Unexpected error cleaning up temp files:", error);
    return { success: false };
  }
}

export async function deleteBookImage(imageId: string, bookId: string) {
  try {
    const supabase = createServerClient();

    // Get image info first
    const { data: imageData, error: fetchError } = await supabase
      .from("book_images")
      .select("image_url")
      .eq("id", imageId)
      .single();

    if (fetchError || !imageData) {
      throw new Error("Image not found");
    }

    // Extract file path from URL
    const url = new URL(imageData.image_url);
    const filePath = url.pathname.split("/").slice(-2).join("/"); // Get last two parts of path

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("book-images")
      .remove([filePath]);

    if (storageError) {
      console.error("Error deleting from storage:", storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("book_images")
      .delete()
      .eq("id", imageId);

    if (dbError) {
      throw new Error(`Failed to delete image record: ${dbError.message}`);
    }

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

export async function setCoverImage(
  imageId: string,
  bookId: string,
  isExisting: boolean,
) {
  try {
    const supabase = createServerClient();

    if (isExisting) {
      // Update existing images in database
      await supabase
        .from("book_images")
        .update({ is_cover: false })
        .eq("book_id", bookId);

      await supabase
        .from("book_images")
        .update({ is_cover: true })
        .eq("id", imageId);
    }

    // Revalidate the page
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
