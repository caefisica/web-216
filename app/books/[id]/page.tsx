"use client";

export const runtime = 'edge';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useBookData } from "./hooks/use-book-data";
import { useHeartStatus } from "./hooks/use-heart-status";
import { useBookActions } from "./hooks/use-book-actions";
import { LoadingState } from "./components/loading-state";
import { NotFoundState } from "./components/not-found-state";
import { BookImage } from "./components/book-image";
import { BookActions } from "./components/book-actions";
import { BookHeader } from "./components/book-header";
import { BookDetails } from "./components/book-details";
import { EditForm } from "./components/edit-form";
import type { BookFormData } from "./types/book-types";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { saveBookWithImages, deleteBookImage, setCoverImage } from "./actions";

// Add this temporary type definition since we don't have the separate files yet
interface Category {
  id: string;
  name: string;
}

interface UploadedImage {
  id: string;
  url: string;
  fileName: string;
  isCover: boolean;
  altText: string;
}

// Add this temporary function since we don't have the separate utility file yet
const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data || [];
};

export default function BookDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const bookId = params.id as string;

  // Custom hooks
  const { book, loading, fetchBook } = useBookData(bookId);
  const { isHearted, checkHeartStatus, handleHeart } = useHeartStatus(
    user,
    bookId,
  );
  const {
    borrowing,
    borrowNote,
    setBorrowNote,
    dialogOpen,
    setDialogOpen,
    handleBorrowRequest,
    handleUpdateBook,
  } = useBookActions(user, bookId);

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<BookFormData>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Derived state
  const canEdit = Boolean(
    user && (user.role === "librarian" || user.role === "admin"),
  );
  const heartsCount = book?.hearts_count?.[0]?.count || 0;

  // Effects
  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  useEffect(() => {
    checkHeartStatus();
  }, [checkHeartStatus]);

  useEffect(() => {
    if (book) {
      setEditForm(book);
    }
  }, [book]);

  // Event handlers
  const handleHeartClick = () => {
    handleHeart(fetchBook);
  };

  const handleEditFormChange = (field: keyof BookFormData, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEditing = async () => {
    if (!isEditing) {
      // Entering edit mode - fetch fresh data
      const categoryData = await fetchCategories();
      setCategories(categoryData);

      if (book) {
        setEditForm(book);
        // Set current category (single category from category_id)
        setSelectedCategories(book.category_id ? [book.category_id] : []);

        // Fetch existing images for this book
        const { data: images, error } = await supabase
          .from("book_images")
          .select("*")
          .eq("book_id", bookId)
          .order("display_order");

        if (!error && images) {
          setExistingImages(images);
        } else {
          // If no images in book_images table, check if there's a legacy image_url
          if (book.image_url) {
            setExistingImages([
              {
                id: "legacy",
                book_id: bookId,
                image_url: book.image_url,
                is_cover: true,
                display_order: 0,
                created_at: new Date().toISOString(),
              },
            ]);
          } else {
            setExistingImages([]);
          }
        }
      }
    }
    setIsEditing(!isEditing);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const removeExistingImage = async (imageId: string) => {
    try {
      const result = await deleteBookImage(imageId, bookId);

      if (result.success) {
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
        toast({
          title: "Imagen eliminada",
          description: "La imagen ha sido eliminada correctamente.",
        });
      } else {
        throw new Error(result.error || "Error desconocido");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen.",
        variant: "destructive",
      });
    }
  };

  const handleSetCoverImage = async (imageId: string, isExisting: boolean) => {
    try {
      const result = await setCoverImage(imageId, bookId, isExisting);

      if (result.success) {
        if (isExisting) {
          setExistingImages((prev) =>
            prev.map((img) => ({ ...img, is_cover: img.id === imageId })),
          );
        }
        toast({
          title: "Portada actualizada",
          description: "La imagen de portada ha sido actualizada.",
        });
      } else {
        throw new Error(result.error || "Error desconocido");
      }
    } catch (error) {
      console.error("Error setting cover image:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la imagen de portada.",
        variant: "destructive",
      });
    }
  };

  const handleSaveBookAsync = async (uploadedImages: UploadedImage[]) => {
    if (!user) return;

    setSaving(true);
    try {
      const bookData = {
        title: editForm.title,
        author: editForm.author,
        isbn: editForm.isbn || null,
        publisher: editForm.publisher || null,
        publication_year: editForm.publication_year
          ? Number.parseInt(editForm.publication_year.toString())
          : null,
        pages: editForm.pages
          ? Number.parseInt(editForm.pages.toString())
          : null,
        description: editForm.description || null,
        status: editForm.status,
        location: editForm.location || null,
        // Update the single category_id field (use first selected category for now)
        category_id:
          selectedCategories.length > 0 ? selectedCategories[0] : null,
      };

      const result = await saveBookWithImages({
        bookId,
        bookData,
        uploadedImages: uploadedImages.map((img) => ({
          id: img.id,
          fileName: img.fileName,
          isCover: img.isCover,
          altText: img.altText,
        })),
        selectedCategories,
      });

      if (result.success) {
        toast({
          title: "Libro actualizado",
          description: `${result.message}. ${result.imagesProcessed} imágenes procesadas.`,
        });

        // Exit edit mode and refresh data
        setIsEditing(false);
        await fetchBook();
      } else {
        throw new Error(result.error || "Error desconocido");
      }
    } catch (error) {
      console.error("Error saving book:", error);
      toast({
        title: "Error",
        description:
          "No se pudo actualizar el libro. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Loading and error states
  if (loading) return <LoadingState />;
  if (!book) return <NotFoundState />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Image and Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookImage images={book.images} title={book.title} />
              <BookActions
                book={book}
                isHearted={isHearted}
                heartsCount={heartsCount}
                onHeart={handleHeartClick}
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
                borrowNote={borrowNote}
                setBorrowNote={setBorrowNote}
                borrowing={borrowing}
                onBorrowRequest={handleBorrowRequest}
              />
            </div>
          </div>

          {/* Book Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border p-6">
              <BookHeader
                book={book}
                canEdit={canEdit}
                isEditing={isEditing}
                onToggleEditing={toggleEditing}
              />

              {isEditing && canEdit ? (
                <EditForm
                  editForm={editForm}
                  onFormChange={handleEditFormChange}
                  onSave={handleSaveBookAsync}
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onCategoryToggle={handleCategoryToggle}
                  existingImages={existingImages}
                  onRemoveExistingImage={removeExistingImage}
                  onSetCover={handleSetCoverImage}
                  saving={saving}
                  bookId={bookId}
                  userId={user?.id}
                />
              ) : (
                <BookDetails book={book} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
