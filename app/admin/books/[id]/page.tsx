"use client";

export const runtime = 'edge';

import type React from "react";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { supabase } from "@/lib/supabase";
import type { Category, BookImage } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  X,
  Loader2,
  Save,
  AlertTriangle,
  Trash2,
  Star,
  Upload,
} from "lucide-react";
import { useDropzone } from "react-dropzone";

interface ImageUpload {
  id: string;
  file: File;
  preview: string;
  isCover: boolean;
  altText: string;
}

export default function EditBookPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<BookImage[]>([]);
  const [newImageUploads, setNewImageUploads] = useState<ImageUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publication_year: "",
    pages: "",
    description: "",
    status: "available",
    location: "",
  });

  useEffect(() => {
    if (
      !authLoading &&
      (!user || (user.role !== "librarian" && user.role !== "admin"))
    ) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && (user.role === "librarian" || user.role === "admin")) {
      fetchCategories();
      fetchBookDetails();
    }
  }, [user, bookId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías.",
        variant: "destructive",
      });
    }
  };

  const fetchBookDetails = async () => {
    try {
      // Fetch book details with categories and images
      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .select(
          `
          *,
          book_categories (
            category_id,
            categories (*)
          ),
          book_images (*)
        `,
        )
        .eq("id", bookId)
        .single();

      if (bookError) throw bookError;

      if (bookData) {
        setFormData({
          title: bookData.title || "",
          author: bookData.author || "",
          isbn: bookData.isbn || "",
          publisher: bookData.publisher || "",
          publication_year: bookData.publication_year?.toString() || "",
          pages: bookData.pages?.toString() || "",
          description: bookData.description || "",
          status: bookData.status || "available",
          location: bookData.location || "",
        });

        // Set selected categories
        const categoryIds =
          bookData.book_categories?.map((bc: any) => bc.category_id) || [];
        setSelectedCategories(categoryIds);

        // Set existing images
        const images = bookData.book_images || [];
        setExistingImages(
          images.sort(
            (a: BookImage, b: BookImage) => a.display_order - b.display_order,
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching book details:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del libro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        if (file.type.startsWith("image/")) {
          const newImage: ImageUpload = {
            id: Math.random().toString(36).substring(2, 15),
            file,
            preview: URL.createObjectURL(file),
            isCover:
              existingImages.length === 0 && newImageUploads.length === 0,
            altText: "",
          };
          setNewImageUploads((prev) => [...prev, newImage]);
        } else {
          toast({
            title: "Tipo de archivo inválido",
            description: "Por favor, sube archivos de imagen (JPEG, PNG, etc.)",
            variant: "destructive",
          });
        }
      });
    },
    [existingImages.length, newImageUploads.length],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const { error } = await supabase
        .from("book_images")
        .delete()
        .eq("id", imageId);
      if (error) throw error;

      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast({
        title: "Imagen eliminada",
        description: "La imagen ha sido eliminada correctamente.",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen.",
        variant: "destructive",
      });
    }
  };

  const removeNewImage = (imageId: string) => {
    setNewImageUploads((prev) => prev.filter((img) => img.id !== imageId));
  };

  const setCoverImage = async (imageId: string, isExisting: boolean) => {
    try {
      if (isExisting) {
        // Update existing images
        const { error } = await supabase
          .from("book_images")
          .update({ is_cover: false })
          .eq("book_id", bookId);

        if (error) throw error;

        const { error: setCoverError } = await supabase
          .from("book_images")
          .update({ is_cover: true })
          .eq("id", imageId);

        if (setCoverError) throw setCoverError;

        setExistingImages((prev) =>
          prev.map((img) => ({ ...img, is_cover: img.id === imageId })),
        );
      } else {
        // Update new uploads
        setNewImageUploads((prev) =>
          prev.map((img) => ({ ...img, isCover: img.id === imageId })),
        );
        // Also unset existing covers
        setExistingImages((prev) =>
          prev.map((img) => ({ ...img, is_cover: false })),
        );
      }

      toast({
        title: "Portada actualizada",
        description: "La imagen de portada ha sido actualizada.",
      });
    } catch (error) {
      console.error("Error setting cover image:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la imagen de portada.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.author) {
      toast({
        title: "Información faltante",
        description: "El título y el autor son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Convert numeric fields
      const publication_year = formData.publication_year
        ? Number.parseInt(formData.publication_year)
        : null;
      const pages = formData.pages ? Number.parseInt(formData.pages) : null;

      // Update book record
      const { error: bookError } = await supabase
        .from("books")
        .update({
          title: formData.title,
          author: formData.author,
          isbn: formData.isbn || null,
          publisher: formData.publisher || null,
          publication_year,
          pages,
          description: formData.description || null,
          status: formData.status,
          location: formData.location || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookId);

      if (bookError) throw bookError;

      // Upload new images
      for (let i = 0; i < newImageUploads.length; i++) {
        const imageUpload = newImageUploads[i];
        const fileExt = imageUpload.file.name.split(".").pop();
        const fileName = `${bookId}_${Date.now()}_${i}.${fileExt}`;
        const filePath = `book-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("books")
          .upload(filePath, imageUpload.file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("books")
          .getPublicUrl(filePath);

        // Insert image record
        const { error: imageError } = await supabase
          .from("book_images")
          .insert([
            {
              book_id: bookId,
              image_url: publicUrlData.publicUrl,
              is_cover: imageUpload.isCover,
              alt_text: imageUpload.altText || null,
              display_order: existingImages.length + i,
            },
          ]);

        if (imageError) throw imageError;
      }

      // Update categories
      // First, delete existing category associations
      const { error: deleteCategoriesError } = await supabase
        .from("book_categories")
        .delete()
        .eq("book_id", bookId);

      if (deleteCategoriesError) throw deleteCategoriesError;

      // Then, insert new category associations
      if (selectedCategories.length > 0) {
        const categoryInserts = selectedCategories.map((categoryId) => ({
          book_id: bookId,
          category_id: categoryId,
        }));

        const { error: categoryError } = await supabase
          .from("book_categories")
          .insert(categoryInserts);
        if (categoryError) throw categoryError;
      }

      toast({
        title: "Libro actualizado",
        description: "El libro ha sido actualizado correctamente.",
      });

      // Refresh the book details
      fetchBookDetails();
      setNewImageUploads([]);
    } catch (error) {
      console.error("Error updating book:", error);
      toast({
        title: "Error",
        description:
          "No se pudo actualizar el libro. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = async () => {
    try {
      const { error } = await supabase.from("books").delete().eq("id", bookId);

      if (error) throw error;

      toast({
        title: "Libro eliminado",
        description:
          "El libro ha sido eliminado correctamente de la biblioteca.",
      });

      router.push("/");
    } catch (error) {
      console.error("Error deleting book:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el libro.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse h-8 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="animate-pulse h-4 w-64 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="animate-pulse bg-white rounded-lg h-96"></div>
            <div className="lg:col-span-2 animate-pulse bg-white rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  const allImages = [...existingImages, ...newImageUploads];
  const hasCoverImage = allImages.some((img) =>
    "is_cover" in img ? img.is_cover : img.isCover,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Editar libro
            </h1>
            <p className="text-lg text-gray-600">
              Actualizar la información del libro en la colección de la
              biblioteca
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Image Management */}
            <div className="lg:order-1">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">
                    Imágenes del libro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">
                        Imágenes actuales ({existingImages.length})
                      </h4>
                      {existingImages.map((image) => (
                        <div
                          key={image.id}
                          className="relative border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative w-16 h-20 flex-shrink-0">
                              <Image
                                src={image.image_url || "/placeholder.svg"}
                                alt={image.alt_text || "Imagen del libro"}
                                fill
                                className="object-cover rounded"
                              />
                              {image.is_cover && (
                                <div className="absolute -top-1 -right-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex gap-2">
                                {!image.is_cover && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setCoverImage(image.id, true)
                                    }
                                    className="text-xs"
                                  >
                                    <Star className="h-3 w-3 mr-1" />
                                    Portada
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeExistingImage(image.id)}
                                  className="text-xs"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Eliminar
                                </Button>
                              </div>
                            </div>
                          </div>
                          {image.is_cover && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Imagen de portada
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New Image Upload Area */}
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-md flex flex-col items-center justify-center p-6 cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-center text-gray-600 mb-1">
                      {isDragActive
                        ? "Suelta las imágenes aquí"
                        : "Añadir más imágenes"}
                    </p>
                    <p className="text-xs text-center text-gray-500">
                      Arrastra y suelta o haz clic
                    </p>
                  </div>

                  {/* New Images */}
                  {newImageUploads.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">
                        Nuevas imágenes ({newImageUploads.length})
                      </h4>
                      {newImageUploads.map((imageUpload) => (
                        <div
                          key={imageUpload.id}
                          className="relative border rounded-lg p-3 space-y-2 bg-blue-50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative w-16 h-20 flex-shrink-0">
                              <Image
                                src={imageUpload.preview || "/placeholder.svg"}
                                alt="Nueva imagen"
                                fill
                                className="object-cover rounded"
                              />
                              {imageUpload.isCover && (
                                <div className="absolute -top-1 -right-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex gap-2">
                                {!imageUpload.isCover && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setCoverImage(imageUpload.id, false)
                                    }
                                    className="text-xs"
                                  >
                                    <Star className="h-3 w-3 mr-1" />
                                    Portada
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeNewImage(imageUpload.id)}
                                  className="text-xs"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Eliminar
                                </Button>
                              </div>
                            </div>
                          </div>
                          {imageUpload.isCover && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Nueva imagen de portada
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!hasCoverImage && allImages.length > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        ⚠️ No hay imagen de portada seleccionada. Selecciona una
                        imagen como portada.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Book Details */}
            <div className="lg:col-span-2 lg:order-2">
              <Card className="shadow-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-lg font-semibold">
                    Información del libro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        Información básica
                      </h3>
                      <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="title"
                          className="text-sm font-medium text-gray-900"
                        >
                          Título <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Ingresa el título del libro"
                          required
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="author"
                          className="text-sm font-medium text-gray-900"
                        >
                          Autor <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="author"
                          name="author"
                          value={formData.author}
                          onChange={handleInputChange}
                          placeholder="Ingresa el nombre del autor"
                          required
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="isbn"
                          className="text-sm font-medium text-gray-900"
                        >
                          ISBN
                        </Label>
                        <Input
                          id="isbn"
                          name="isbn"
                          value={formData.isbn}
                          onChange={handleInputChange}
                          placeholder="Ingresa ISBN (opcional)"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="publisher"
                          className="text-sm font-medium text-gray-900"
                        >
                          Editorial
                        </Label>
                        <Input
                          id="publisher"
                          name="publisher"
                          value={formData.publisher}
                          onChange={handleInputChange}
                          placeholder="Ingresa el nombre de la editorial"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="publication_year"
                          className="text-sm font-medium text-gray-900"
                        >
                          Año de publicación
                        </Label>
                        <Input
                          id="publication_year"
                          name="publication_year"
                          type="number"
                          value={formData.publication_year}
                          onChange={handleInputChange}
                          placeholder="Ingresa el año"
                          min="1000"
                          max={new Date().getFullYear()}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="pages"
                          className="text-sm font-medium text-gray-900"
                        >
                          Número de páginas
                        </Label>
                        <Input
                          id="pages"
                          name="pages"
                          type="number"
                          value={formData.pages}
                          onChange={handleInputChange}
                          placeholder="Ingresa el número de páginas"
                          min="1"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-8" />

                  {/* Categories */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        Categorías
                      </h3>
                      <div className="h-px bg-gray-200 flex-1"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() =>
                              handleCategoryToggle(category.id)
                            }
                          />
                          <Label
                            htmlFor={`category-${category.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedCategories.map((categoryId) => {
                          const category = categories.find(
                            (c) => c.id === categoryId,
                          );
                          return category ? (
                            <Badge key={categoryId} variant="secondary">
                              {category.name}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 ml-2"
                                onClick={() => handleCategoryToggle(categoryId)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  <Separator className="my-8" />

                  {/* Library Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        Información de biblioteca
                      </h3>
                      <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="status"
                          className="text-sm font-medium text-gray-900"
                        >
                          Estado
                        </Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, status: value }))
                          }
                        >
                          <SelectTrigger
                            id="status"
                            className="focus:ring-2 focus:ring-blue-500"
                          >
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">
                              Disponible
                            </SelectItem>
                            <SelectItem value="borrowed">Prestado</SelectItem>
                            <SelectItem value="maintenance">
                              En mantenimiento
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="location"
                          className="text-sm font-medium text-gray-900"
                        >
                          Ubicación en biblioteca
                        </Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="Ingresa la ubicación del estante (ej: 'Estante A, Nivel 3')"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-8" />

                  {/* Description */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium text-gray-900"
                    >
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Ingresa la descripción del libro"
                      rows={5}
                      className="focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar libro
                    </Button>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" asChild>
                        <Link href="/">Cancelar</Link>
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="min-w-[120px]"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Confirmar eliminación
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              ¿Estás seguro de que quieres eliminar este libro? Esta acción no
              se puede deshacer y eliminará permanentemente el libro de la
              colección junto con todas sus imágenes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBook}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar libro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
