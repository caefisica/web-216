"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import {
  Star,
  Upload,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import type { BookFormData } from "../types/book-types";

interface UploadedImage {
  id: string;
  url: string;
  fileName: string;
  isCover: boolean;
  altText: string;
  isUploading: boolean;
  uploadError?: string;
  uploadProgress?: number;
  retryCount?: number;
  abortController?: AbortController;
}

interface ExistingImage {
  id: string;
  image_url: string;
  is_cover: boolean;
  alt_text?: string;
  display_order: number;
}

interface EditFormProps {
  editForm: BookFormData;
  onFormChange: (field: keyof BookFormData, value: string) => void;
  onSave: (uploadedImages: UploadedImage[]) => void;
  existingImages?: ExistingImage[];
  categories?: Array<{ id: string; name: string }>;
  selectedCategories?: string[];
  onCategoryToggle?: (categoryId: string) => void;
  onImageRemove?: (imageId: string, isExisting: boolean) => void;
  onSetCover?: (imageId: string, isExisting: boolean) => void;
  saving?: boolean;
  bookId: string;
  userId?: string;
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

export function EditForm({
  editForm,
  onFormChange,
  onSave,
  existingImages = [],
  categories = [],
  selectedCategories = [],
  onCategoryToggle,
  onImageRemove,
  onSetCover,
  saving = false,
  bookId,
  userId,
}: EditFormProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [tempFiles, setTempFiles] = useState<string[]>([]);
  const uploadTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup temp files and timeouts on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      uploadTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      uploadTimeouts.current.clear();

      // Cleanup any temp files that weren't saved
      tempFiles.forEach(async (fileName) => {
        try {
          await supabase.storage
            .from("book-images")
            .remove([`temp/${fileName}`]);
        } catch (error) {
          console.warn("Could not cleanup temp file:", fileName);
        }
      });
    };
  }, [tempFiles]);

  // Check if file exists in bucket
  const checkFileExists = async (filePath: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.storage
        .from("book-images")
        .list("temp", {
          search: filePath.split("/").pop(),
        });
      return !error && data && data.length > 0;
    } catch {
      return false;
    }
  };

  // Get file size for upload progress
  const getFileSize = async (filePath: string): Promise<number> => {
    try {
      const { data, error } = await supabase.storage
        .from("book-images")
        .list("temp", {
          search: filePath.split("/").pop(),
        });
      if (!error && data && data.length > 0) {
        return data[0].metadata?.size || 0;
      }
    } catch {
      // Ignore errors
    }
    return 0;
  };

  const uploadImageWithRetry = async (
    file: File,
    imageId: string,
    retryCount = 0,
  ): Promise<{ success: boolean; url?: string; fileName?: string }> => {
    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const originalName = file.name.replace(/\.[^/.]+$/, "").substring(0, 20);
    const fileName = `temp_${bookId}_${timestamp}_${randomId}_${originalName}.${fileExt}`;
    const filePath = `temp/${fileName}`;

    // Create abort controller for this upload
    const abortController = new AbortController();

    // Update image state with abort controller
    setUploadedImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              abortController,
              retryCount,
              uploadProgress: 0,
            }
          : img,
      ),
    );

    try {
      // First, check if file already exists (in case previous upload succeeded but we didn't get confirmation)
      if (retryCount > 0) {
        const exists = await checkFileExists(filePath);
        if (exists) {
          const { data: publicUrlData } = supabase.storage
            .from("book-images")
            .getPublicUrl(filePath);
          return { success: true, url: publicUrlData.publicUrl, fileName };
        }
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? {
                  ...img,
                  uploadProgress: Math.min(
                    (img.uploadProgress || 0) + Math.random() * 20,
                    90,
                  ),
                }
              : img,
          ),
        );
      }, 200);

      // Upload to storage
      const { data, error } = await supabase.storage
        .from("book-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      // Complete progress
      setUploadedImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, uploadProgress: 100 } : img,
        ),
      );

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("book-images")
        .getPublicUrl(filePath);

      return { success: true, url: publicUrlData.publicUrl, fileName };
    } catch (error: any) {
      console.error(`Upload attempt ${retryCount + 1} failed:`, error);

      // Check if upload was aborted
      if (error.name === "AbortError" || abortController.signal.aborted) {
        return { success: false };
      }

      // Retry logic
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        toast({
          title: `Reintentando subida (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`,
          description: `Reintentando subir ${file.name}...`,
        });

        // Wait before retry
        await new Promise((resolve) => {
          const timeout = setTimeout(resolve, RETRY_DELAY * (retryCount + 1));
          uploadTimeouts.current.set(imageId, timeout);
        });

        // Remove timeout from map
        uploadTimeouts.current.delete(imageId);

        // Check if upload was cancelled during retry delay
        if (abortController.signal.aborted) {
          return { success: false };
        }

        return uploadImageWithRetry(file, imageId, retryCount + 1);
      }

      return { success: false };
    }
  };

  const uploadImageImmediately = async (file: File, imageId: string) => {
    try {
      const result = await uploadImageWithRetry(file, imageId);

      if (result.success && result.url && result.fileName) {
        // Update the image with success state
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? {
                  ...img,
                  url: result.url!,
                  fileName: result.fileName!,
                  isUploading: false,
                  uploadError: undefined,
                  uploadProgress: 100,
                  abortController: undefined,
                }
              : img,
          ),
        );

        // Track temp file for cleanup
        setTempFiles((prev) => [...prev, result.fileName!]);

        toast({
          title: "Imagen subida",
          description: `${file.name} se ha subido correctamente.`,
        });
      } else {
        // Update with error state
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? {
                  ...img,
                  isUploading: false,
                  uploadError: "Error al subir después de varios intentos",
                  uploadProgress: 0,
                  abortController: undefined,
                }
              : img,
          ),
        );

        toast({
          title: "Error al subir imagen",
          description: `No se pudo subir ${file.name} después de ${MAX_RETRY_ATTEMPTS} intentos.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Unexpected upload error:", error);
      setUploadedImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? {
                ...img,
                isUploading: false,
                uploadError: "Error inesperado",
                uploadProgress: 0,
                abortController: undefined,
              }
            : img,
        ),
      );
    }
  };

  const cancelUpload = (imageId: string) => {
    const image = uploadedImages.find((img) => img.id === imageId);
    if (image?.abortController) {
      image.abortController.abort();
    }

    // Clear any pending timeout
    const timeout = uploadTimeouts.current.get(imageId);
    if (timeout) {
      clearTimeout(timeout);
      uploadTimeouts.current.delete(imageId);
    }

    // Remove image from state
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));

    toast({
      title: "Subida cancelada",
      description: "La subida de la imagen ha sido cancelada.",
    });
  };

  const retryUpload = (imageId: string) => {
    const image = uploadedImages.find((img) => img.id === imageId);
    if (!image) return;

    // Reset image state for retry
    setUploadedImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              isUploading: true,
              uploadError: undefined,
              uploadProgress: 0,
              retryCount: 0,
            }
          : img,
      ),
    );

    // We need to get the original file somehow - for now, let's show a message
    toast({
      title: "Reintentar subida",
      description:
        "Por favor, vuelve a seleccionar el archivo para reintentarlo.",
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const imageId = `upload_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`;

        // Add placeholder immediately
        const placeholderImage: UploadedImage = {
          id: imageId,
          url: "",
          fileName: file.name,
          isCover:
            existingImages.length === 0 &&
            uploadedImages.length === 0 &&
            i === 0,
          altText: "",
          isUploading: true,
          uploadProgress: 0,
          retryCount: 0,
        };

        setUploadedImages((prev) => [...prev, placeholderImage]);

        // Start upload with small delay to ensure unique timestamps
        setTimeout(() => {
          uploadImageImmediately(file, imageId);
        }, i * 100);
      }
    },
    [existingImages.length, uploadedImages.length, bookId],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".gif", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB limit
  });

  const handleRemoveUploadedImage = async (imageId: string) => {
    const imageToRemove = uploadedImages.find((img) => img.id === imageId);
    if (!imageToRemove) return;

    // Cancel upload if still in progress
    if (imageToRemove.isUploading && imageToRemove.abortController) {
      imageToRemove.abortController.abort();
    }

    try {
      // Remove from storage if it was uploaded
      if (imageToRemove.fileName && !imageToRemove.isUploading) {
        await supabase.storage
          .from("book-images")
          .remove([`temp/${imageToRemove.fileName}`]);
        setTempFiles((prev) =>
          prev.filter((fileName) => fileName !== imageToRemove.fileName),
        );
      }

      // Remove from state
      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));

      toast({
        title: "Imagen eliminada",
        description: "La imagen ha sido eliminada.",
      });
    } catch (error) {
      console.error("Error removing image:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen.",
        variant: "destructive",
      });
    }
  };

  const handleSetCover = (imageId: string, isExisting: boolean) => {
    if (isExisting) {
      onSetCover?.(imageId, true);
    } else {
      setUploadedImages((prev) =>
        prev.map((img) => ({ ...img, isCover: img.id === imageId })),
      );
      onSetCover?.(imageId, false);
    }
  };

  const handleSave = () => {
    onSave(
      uploadedImages.filter((img) => !img.isUploading && !img.uploadError),
    );
  };

  return (
    <div className="space-y-4 border-t pt-6">
      <h3 className="text-lg font-semibold">Editar información del libro</h3>

      {/* Image Upload Section */}
      <div className="space-y-4">
        <Label>Imágenes del libro</Label>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            {isDragActive ? (
              <p className="text-blue-600">Suelta las imágenes aquí...</p>
            ) : (
              <div>
                <p className="text-gray-600">
                  Arrastra imágenes aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  PNG, JPG, GIF hasta 5MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Images Grid */}
        {uploadedImages.length > 0 && (
          <div>
            <Label className="text-sm font-medium">Nuevas imágenes</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {uploadedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                    {image.isUploading ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400 mb-2" />
                        <Progress
                          value={image.uploadProgress || 0}
                          className="w-full h-2"
                        />
                        <span className="text-xs text-gray-500 mt-1">
                          {Math.round(image.uploadProgress || 0)}%
                        </span>
                      </div>
                    ) : image.uploadError ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 p-2">
                        <XCircle className="h-6 w-6 text-red-500 mb-1" />
                        <span className="text-xs text-red-600 text-center">
                          {image.uploadError}
                        </span>
                      </div>
                    ) : (
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt="Uploaded image"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    )}
                  </div>

                  {/* Upload Controls */}
                  {image.isUploading && (
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelUpload(image.id)}
                        className="h-7 w-7 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {/* Error Controls */}
                  {image.uploadError && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryUpload(image.id)}
                        className="h-7 w-7 p-0"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveUploadedImage(image.id)}
                        className="h-7 w-7 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {/* Success Controls */}
                  {!image.isUploading && !image.uploadError && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg">
                      <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant={image.isCover ? "default" : "secondary"}
                          onClick={() => handleSetCover(image.id, false)}
                          className="h-7 w-7 p-0"
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveUploadedImage(image.id)}
                          className="h-7 w-7 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Cover Badge */}
                  {image.isCover &&
                    !image.isUploading &&
                    !image.uploadError && (
                      <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                        Portada
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Images Grid */}
        {existingImages.length > 0 && (
          <div>
            <Label className="text-sm font-medium">Imágenes actuales</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {existingImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                    <Image
                      src={image.image_url || "/placeholder.svg"}
                      alt={image.alt_text || "Book image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg">
                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant={image.is_cover ? "default" : "secondary"}
                        onClick={() => handleSetCover(image.id, true)}
                        className="h-7 w-7 p-0"
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onImageRemove?.(image.id, true)}
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {image.is_cover && (
                    <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      Portada
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Book Information Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={editForm.title || ""}
            onChange={(e) => onFormChange("title", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="author">Autor</Label>
          <Input
            id="author"
            value={editForm.author || ""}
            onChange={(e) => onFormChange("author", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            value={editForm.isbn || ""}
            onChange={(e) => onFormChange("isbn", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="publisher">Editorial</Label>
          <Input
            id="publisher"
            value={editForm.publisher || ""}
            onChange={(e) => onFormChange("publisher", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="location">Ubicación</Label>
          <Input
            id="location"
            value={editForm.location || ""}
            onChange={(e) => onFormChange("location", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={editForm.description || ""}
            onChange={(e) => onFormChange("description", e.target.value)}
            rows={4}
          />
        </div>
      </div>

      {/* Category Selection */}
      {categories.length > 0 && (
        <div>
          <Label>Categorías</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => onCategoryToggle?.(category.id)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={saving || uploadedImages.some((img) => img.isUploading)}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </div>
    </div>
  );
}
