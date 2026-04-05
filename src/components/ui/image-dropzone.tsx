"use client";

import * as React from "react";
import { useDropzone, type FileRejection, type DropzoneOptions } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps extends Omit<DropzoneOptions, "onDrop"> {
  onDrop: (acceptedFiles: File[]) => void;
  onRejection?: (fileRejections: FileRejection[]) => void;
  className?: string;
  label?: string;
  description?: string;
}

export function ImageDropzone({
  onDrop,
  onRejection,
  className,
  label = "Subir imágenes",
  description = "Arrastra y suelta o haz clic para seleccionar (JPEG, PNG, WebP)",
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
  },
  maxSize = 5 * 1024 * 1024, // Default 5MB
  multiple = true,
  ...props
}: ImageDropzoneProps) {
  const handleDrop = React.useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      onDrop(acceptedFiles);
      if (fileRejections.length > 0 && onRejection) {
        onRejection(fileRejections);
      }
    },
    [onDrop, onRejection],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxSize,
    multiple,
    ...props,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all",
        isDragActive
          ? "border-blue-400 bg-blue-50/50 scale-[1.02]"
          : "border-gray-200 hover:border-blue-400 hover:bg-gray-50/50",
        className,
      )}
    >
      <input {...getInputProps()} />
      <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <Upload className="h-6 w-6 text-blue-600" />
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">
        {isDragActive ? "Suelta ahora" : label}
      </p>
      <p className="text-xs text-center text-gray-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
