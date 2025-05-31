"use client";

import type React from "react";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "@/hooks/use-toast";
import { X, Loader2, Save, Star, Upload, Trash2 } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface ImageUpload {
  id: string;
  file: File;
  preview: string;
  isCover: boolean;
  altText: string;
}

export default function NewBookPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploads, setImageUploads] = useState<ImageUpload[]>([]);
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
    }
  }, [user]);

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
            isCover: imageUploads.length === 0, // First image is cover by default
            altText: "",
          };
          setImageUploads((prev) => [...prev, newImage]);
        } else {
          toast({
            title: "Tipo de archivo inválido",
            description: "Por favor, sube archivos de imagen (JPEG, PNG, etc.)",
            variant: "destructive",
          });
        }
      });
    },
    [imageUploads.length],
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

  const removeImage = (imageId: string) => {
    setImageUploads((prev) => {
      const updated = prev.filter((img) => img.id !== imageId);
      // If we removed the cover image, make the first remaining image the cover
      if (updated.length > 0 && !updated.some((img) => img.isCover)) {
        updated[0].isCover = true;
      }
      return updated;
    });
  };

  const setCoverImage = (imageId: string) => {
    setImageUploads((prev) =>
      prev.map((img) => ({ ...img, isCover: img.id === imageId })),
    );
  };

  const updateImageAltText = (imageId: string, altText: string) => {
    setImageUploads((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, altText } : img)),
    );
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

    if (imageUploads.length === 0) {
      toast({
        title: "Imagen requerida",
        description: "Por favor, añade al menos una imagen para el libro.",
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

      // Insert book record
      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .insert([
          {
            title: formData.title,
            author: formData.author,
            isbn: formData.isbn || null,
            publisher: formData.publisher || null,
            publication_year,
            pages,
            description: formData.description || null,
            status: formData.status,
            location: formData.location || null,
          },
        ])
        .select()
        .single();

      if (bookError) throw bookError;

      const bookId = bookData.id;

      // Upload images
      const uploadedImages: BookImage[] = [];
      for (let i = 0; i < imageUploads.length; i++) {
        const imageUpload = imageUploads[i];
        const fileExt = imageUpload.file.name.split(".").pop();
        const fileName = `${bookId}_${i}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
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
        const { data: imageData, error: imageError } = await supabase
          .from("book_images")
          .insert([
            {
              book_id: bookId,
              image_url: publicUrlData.publicUrl,
              is_cover: imageUpload.isCover,
              alt_text: imageUpload.altText || null,
              display_order: i,
            },
          ])
          .select()
          .single();

        if (imageError) throw imageError;
        uploadedImages.push(imageData);
      }

      // Insert category associations
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
        title: "Libro añadido",
        description: "El libro se ha añadido correctamente a la biblioteca.",
      });

      // Redirect to books management page
      router.push("/");
    } catch (error) {
      console.error("Error adding book:", error);
      toast({
        title: "Error",
        description: "Error al añadir el libro. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Añadir nuevo libro
            </h1>
            <p className="text-lg text-gray-600">
              Añade un nuevo libro a la colección de la biblioteca
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Image Upload */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Imágenes del libro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image Upload Area */}
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
                        : "Arrastra y suelta imágenes aquí"}
                    </p>
                    <p className="text-xs text-center text-gray-500">
                      o haz clic para seleccionar archivos
                    </p>
                    <p className="text-xs text-center text-gray-400 mt-2">
                      Múltiples imágenes permitidas
                    </p>
                  </div>

                  {/* Uploaded Images */}
                  {imageUploads.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">
                        Imágenes añadidas ({imageUploads.length})
                      </h4>
                      {imageUploads.map((imageUpload, index) => (
                        <div
                          key={imageUpload.id}
                          className="relative border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative w-16 h-20 flex-shrink-0">
                              <Image
                                src={imageUpload.preview || "/placeholder.svg"}
                                alt={`Imagen ${index + 1}`}
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
                              <Input
                                placeholder="Texto alternativo (opcional)"
                                value={imageUpload.altText}
                                onChange={(e) =>
                                  updateImageAltText(
                                    imageUpload.id,
                                    e.target.value,
                                  )
                                }
                                className="text-xs"
                              />
                              <div className="flex gap-2">
                                {!imageUpload.isCover && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setCoverImage(imageUpload.id)
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
                                  onClick={() => removeImage(imageUpload.id)}
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
                              Imagen de portada
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Book Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Información del libro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">
                      Información básica
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">
                          Título <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Ingresa el título del libro"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="author" className="text-sm font-medium">
                          Autor <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="author"
                          name="author"
                          value={formData.author}
                          onChange={handleInputChange}
                          placeholder="Ingresa el nombre del autor"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="isbn" className="text-sm font-medium">
                          ISBN
                        </Label>
                        <Input
                          id="isbn"
                          name="isbn"
                          value={formData.isbn}
                          onChange={handleInputChange}
                          placeholder="Ingresa ISBN (opcional)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="publisher"
                          className="text-sm font-medium"
                        >
                          Editorial
                        </Label>
                        <Input
                          id="publisher"
                          name="publisher"
                          value={formData.publisher}
                          onChange={handleInputChange}
                          placeholder="Ingresa el nombre de la editorial"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="publication_year"
                          className="text-sm font-medium"
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
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pages" className="text-sm font-medium">
                          Páginas
                        </Label>
                        <Input
                          id="pages"
                          name="pages"
                          type="number"
                          value={formData.pages}
                          onChange={handleInputChange}
                          placeholder="Ingresa el número de páginas"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Categories */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Categorías</h3>
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

                  <Separator />

                  {/* Library Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">
                      Información de biblioteca
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium">
                          Estado
                        </Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, status: value }))
                          }
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Selecciona el estado" />
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
                          className="text-sm font-medium"
                        >
                          Ubicación en biblioteca
                        </Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="Ingresa la ubicación del estante (ej: 'Estante A, Nivel 3')"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Description */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
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
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" asChild>
                      <Link href="/">Cancelar</Link>
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar libro
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
