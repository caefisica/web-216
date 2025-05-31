"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookImageProps {
  images?: Array<{ image_url: string; alt_text?: string; is_cover?: boolean }>;
  title?: string;
}

export function BookImage({
  images = [],
  title = "Book cover",
}: BookImageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // If no images provided, use a placeholder
  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border bg-gray-100 mb-6">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          No image available
        </div>
      </div>
    );
  }

  // Find cover image if available
  const coverImageIndex = images.findIndex((img) => img.is_cover);
  const initialIndex = coverImageIndex >= 0 ? coverImageIndex : 0;

  // If only one image, just show it
  if (images.length === 1) {
    return (
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border mb-6">
        <Image
          src={images[0].image_url || "/placeholder.svg"}
          alt={images[0].alt_text || title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
          priority
        />
      </div>
    );
  }

  // Multiple images - show carousel
  return (
    <div className="space-y-2 mb-6">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border">
        <Image
          src={images[currentImageIndex].image_url || "/placeholder.svg"}
          alt={
            images[currentImageIndex].alt_text ||
            `${title} - Image ${currentImageIndex + 1}`
          }
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
          priority
        />

        {/* Navigation arrows */}
        <div className="absolute inset-0 flex items-center justify-between p-2">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full opacity-70 hover:opacity-100"
            onClick={() =>
              setCurrentImageIndex((prev) =>
                prev === 0 ? images.length - 1 : prev - 1,
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full opacity-70 hover:opacity-100"
            onClick={() =>
              setCurrentImageIndex((prev) =>
                prev === images.length - 1 ? 0 : prev + 1,
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>

        {/* Image counter */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            className={`relative h-16 w-12 flex-shrink-0 overflow-hidden rounded border-2 ${
              index === currentImageIndex
                ? "border-primary"
                : "border-transparent"
            }`}
            onClick={() => setCurrentImageIndex(index)}
          >
            <Image
              src={image.image_url || "/placeholder.svg"}
              alt={image.alt_text || `Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="48px"
            />
            {image.is_cover && (
              <div className="absolute bottom-0 left-0 right-0 bg-yellow-500 bg-opacity-80 text-white text-[8px] text-center">
                Cover
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
