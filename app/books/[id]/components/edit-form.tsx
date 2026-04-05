"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import {
  Star,
  Upload,
  Trash2,
  X,
  Loader2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import type { BookFormData } from "../types/book-types";
import { uploadBookImage, deleteBookImage } from "../actions";

interface UploadedImage {
  id: string;
  url: string;
  fileName: string;
  isCover: boolean;
  altText: string;
  isUploading: boolean;
  uploadError?: string;
  uploadProgress?: number;
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
  onSave: (uploadedImages: any[]) => void;
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
}: EditFormProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const imageId = `upload_${Date.now()}_${i}`;

        const placeholder: UploadedImage = {
          id: imageId,
          url: "",
          fileName: file.name,
          isCover: existingImages.length === 0 && i === 0,
          altText: "",
          isUploading: true,
          uploadProgress: 0,
        };

        setUploadedImages((prev) => [...prev, placeholder]);

        try {
          const formData = new FormData();
          formData.append("file", file);
          
          const result = await uploadBookImage(formData);
          
          if (result.success) {
            setUploadedImages((prev) =>
              prev.map((img) =>
                img.id === imageId
                  ? {
                      ...img,
                      url: result.url!,
                      fileName: result.fileName!,
                      isUploading: false,
                      uploadProgress: 100,
                    }
                  : img,
              ),
            );
          }
        } catch (error) {
          setUploadedImages((prev) =>
            prev.map((img) =>
              img.id === imageId
                ? { ...img, isUploading: false, uploadError: "Error al subir" }
                : img,
            ),
          );
        }
      }
    },
    [existingImages.length, bookId],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".jpg", ".webp"] },
    maxSize: 5 * 1024 * 1024,
  });

  const handleRemoveUploadedImage = async (imageId: string) => {
    const image = uploadedImages.find((img) => img.id === imageId);
    if (image?.fileName) {
      await deleteBookImage(image.id, bookId);
    }
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  return (
    <div className="space-y-4 border-t pt-6">
      <h3 className="text-lg font-semibold">Editar información del libro</h3>

      {/* Dropzone */}
      <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"}`}>
        <input {...getInputProps()} />
        <div className="text-center">
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Arrastra imágenes o haz clic para seleccionar</p>
        </div>
      </div>

      {/* New Images */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {uploadedImages.map((image) => (
          <div key={image.id} className="relative aspect-square border rounded-lg overflow-hidden group">
            {image.isUploading ? (
              <div className="flex flex-col items-center justify-center h-full p-2">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400 mb-2" />
                <Progress value={image.uploadProgress} className="h-1 w-full" />
              </div>
            ) : image.uploadError ? (
              <div className="flex flex-col items-center justify-center h-full bg-red-50">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
            ) : (
              <>
                <Image src={image.url} alt="New" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="destructive" onClick={() => handleRemoveUploadedImage(image.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Existing Images */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {existingImages.map((image) => (
          <div key={image.id} className="relative aspect-square border rounded-lg overflow-hidden group">
            <Image src={image.image_url} alt="Existing" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button size="sm" variant={image.is_cover ? "default" : "secondary"} onClick={() => onSetCover?.(image.id, true)}>
                <Star className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onImageRemove?.(image.id, true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {image.is_cover && <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded">Portada</div>}
          </div>
        ))}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label>Título</Label>
          <Input value={editForm.title || ""} onChange={(e) => onFormChange("title", e.target.value)} />
        </div>
        <div>
          <Label>Autor</Label>
          <Input value={editForm.author || ""} onChange={(e) => onFormChange("author", e.target.value)} />
        </div>
        <div>
          <Label>ISBN</Label>
          <Input value={editForm.isbn || ""} onChange={(e) => onFormChange("isbn", e.target.value)} />
        </div>
        <div>
          <Label>Editorial</Label>
          <Input value={editForm.publisher || ""} onChange={(e) => onFormChange("publisher", e.target.value)} />
        </div>
        <div>
          <Label>Año de publicación</Label>
          <Input type="number" value={editForm.publicationYear || ""} onChange={(e) => onFormChange("publicationYear", e.target.value)} />
        </div>
        <div>
          <Label>Páginas</Label>
          <Input type="number" value={editForm.pages || ""} onChange={(e) => onFormChange("pages", e.target.value)} />
        </div>
        <div>
          <Label>Estado</Label>
          <Input value={editForm.status || ""} onChange={(e) => onFormChange("status", e.target.value)} />
        </div>
        <div>
          <Label>Ubicación</Label>
          <Input value={editForm.location || ""} onChange={(e) => onFormChange("location", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Descripción</Label>
          <Textarea value={editForm.description || ""} onChange={(e) => onFormChange("description", e.target.value)} />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <Label>Categorías</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Badge
              key={c.id}
              variant={selectedCategories.includes(c.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onCategoryToggle?.(c.id)}
            >
              {c.name}
            </Badge>
          ))}
        </div>
      </div>

      <Button className="w-full" onClick={() => onSave(uploadedImages)} disabled={saving || uploadedImages.some(i => i.isUploading)}>
        {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Guardar Libro"}
      </Button>
    </div>
  );
}

function Badge({ children, variant, className, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${variant === "default" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"} ${className}`}
    >
      {children}
    </div>
  );
}
