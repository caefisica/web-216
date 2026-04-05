"use client";

import { useState } from "react";
import { BookImage } from "./components/book-image";
import { BookActions } from "./components/book-actions";
import { BookHeader } from "./components/book-header";
import { BookDetails } from "./components/book-details";
import { EditForm } from "./components/edit-form";
import type { BookFormData } from "./types/book-types";
import { toast } from "@/hooks/use-toast";
import { saveBookWithImages, deleteBookImage, setCoverImage } from "./actions";
import { toggleHeart, createBorrowRequest } from "@/lib/actions/books";
import { useRouter } from "next/navigation";

interface BookClientProps {
  initialBook: any;
  categories: any[];
  user: any;
}

export default function BookClient({
  initialBook,
  categories,
  user,
}: BookClientProps) {
  const router = useRouter();
  const [book, setBook] = useState(initialBook);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<BookFormData>(initialBook);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialBook.categories?.map((c: any) => c.id) || []
  );
  const [existingImages, setExistingImages] = useState<any[]>(initialBook.images || []);
  const [saving, setSaving] = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [borrowNote, setBorrowNote] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const canEdit = Boolean(
    user && ((user as any).role === "librarian" || (user as any).role === "admin")
  );

  const handleHeartClick = async () => {
    if (!user) {
      toast({ title: "Inicia sesión", description: "Debes estar conectado para dar corazón." });
      return;
    }
    try {
      const result = await toggleHeart(book.id);
      setBook({ 
        ...book, 
        is_hearted: result.hearted,
        heartsCount: result.hearted ? book.heartsCount + 1 : book.heartsCount - 1
      });
      router.refresh();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar el corazón.", variant: "destructive" });
    }
  };

  const handleBorrowRequest = async () => {
    setBorrowing(true);
    try {
      await createBorrowRequest(book.id, borrowNote);
      setDialogOpen(false);
      setBorrowNote("");
      toast({ title: "Solicitud enviada", description: "Tu solicitud de préstamo ha sido enviada." });
      router.refresh();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo enviar la solicitud.", variant: "destructive" });
    } finally {
      setBorrowing(false);
    }
  };

  const handleSaveBookAsync = async (uploadedImages: any[]) => {
    setSaving(true);
    try {
      const result = await saveBookWithImages({
        bookId: book.id,
        bookData: {
          title: editForm.title!,
          author: editForm.author!,
          isbn: editForm.isbn || undefined,
          publisher: editForm.publisher || undefined,
          publication_year: editForm.publicationYear ? Number(editForm.publicationYear) : undefined,
          pages: editForm.pages ? Number(editForm.pages) : undefined,
          description: editForm.description || undefined,
          status: editForm.status!,
          location: editForm.location || undefined,
          category_id: selectedCategories[0] || undefined,
        },
        uploadedImages,
        selectedCategories,
      });

      if (result.success) {
        toast({ title: "Libro actualizado", description: result.message });
        setIsEditing(false);
        router.refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const removeExistingImage = async (imageId: string) => {
    const result = await deleteBookImage(imageId, book.id);
    if (result.success) {
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast({ title: "Imagen eliminada" });
    }
  };

  const handleSetCoverImage = async (imageId: string, isExisting: boolean) => {
    const result = await setCoverImage(imageId, book.id, isExisting);
    if (result.success) {
      if (isExisting) {
        setExistingImages(prev => prev.map(img => ({ ...img, is_cover: img.id === imageId })));
      }
      toast({ title: "Portada actualizada" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookImage images={existingImages} title={book.title} />
              <BookActions
                book={book}
                isHearted={book.is_hearted}
                heartsCount={book.heartsCount}
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
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border p-6">
              <BookHeader
                book={book}
                canEdit={canEdit}
                isEditing={isEditing}
                onToggleEditing={() => setIsEditing(!isEditing)}
              />
              {isEditing ? (
                <EditForm
                  editForm={editForm}
                  onFormChange={(f, v) => setEditForm(p => ({ ...p, [f]: v }))}
                  onSave={handleSaveBookAsync}
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onCategoryToggle={(id) => setSelectedCategories(prev => 
                    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                  )}
                  existingImages={existingImages}
                  onImageRemove={removeExistingImage}
                  onSetCover={handleSetCoverImage}
                  saving={saving}
                  bookId={book.id}
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
