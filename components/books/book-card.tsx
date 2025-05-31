"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface BookCardProps {
  book: Book;
  onHeartChange?: () => void;
}

export function BookCard({ book, onHeartChange }: BookCardProps) {
  const { user } = useAuth();
  const [isHearted, setIsHearted] = useState(book.is_hearted || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleHeart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Inicie sesión",
        description:
          "Necesita iniciar sesión para marcar libros como favoritos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isHearted) {
        const { error } = await supabase
          .from("user_book_hearts")
          .delete()
          .eq("user_id", user.id)
          .eq("book_id", book.id);

        if (error) throw error;
        setIsHearted(false);
        toast({
          title: "Eliminado de favoritos",
          description: "Libro eliminado de tus favoritos.",
        });
      } else {
        const { error } = await supabase
          .from("user_book_hearts")
          .insert([{ user_id: user.id, book_id: book.id }]);

        if (error) throw error;
        setIsHearted(true);
        toast({
          title: "Añadido a favoritos",
          description: "Libro añadido a tus favoritos.",
        });
      }
      onHeartChange?.();
    } catch (error) {
      console.error("Error updating heart:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar favoritos. Inténtelo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "borrowed":
        return "bg-red-100 text-red-800 border-red-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "disponible";
      case "borrowed":
        return "prestado";
      case "maintenance":
        return "en mantenimiento";
      default:
        return status;
    }
  };

  // Get cover image or first image
  const coverImage =
    book.images?.find((img) => img.is_cover) || book.images?.[0];
  const imageUrl =
    coverImage?.image_url ||
    book.cover_image?.image_url ||
    "/placeholder.svg?height=400&width=300";

  return (
    <Link href={`/books/${book.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-gray-300 hover:-translate-y-1">
        <CardContent className="p-0">
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={coverImage?.alt_text || book.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute top-3 left-3">
              <Badge className={getStatusColor(book.status)} variant="outline">
                {getStatusText(book.status)}
              </Badge>
            </div>
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHeart}
                disabled={isLoading}
                className={`h-8 w-8 p-0 bg-white/90 hover:bg-white transition-all duration-200 ${
                  isHearted
                    ? "text-red-500 hover:text-red-600"
                    : "text-gray-600 hover:text-red-500"
                } ${isLoading ? "animate-pulse" : ""}`}
              >
                <Heart
                  className={`h-4 w-4 transition-all duration-200 ${isHearted ? "fill-current scale-110" : ""}`}
                />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                {book.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{book.author}</p>
            </div>

            <div className="flex items-center justify-between">
              {book.categories && book.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {book.categories.slice(0, 2).map((category) => (
                    <Badge
                      key={category.id}
                      variant="secondary"
                      className="text-xs"
                    >
                      {category.name}
                    </Badge>
                  ))}
                  {book.categories.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{book.categories.length - 2}
                    </Badge>
                  )}
                </div>
              )}
              {book.location && (
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  {book.location}
                </div>
              )}
            </div>

            {book.hearts_count?.count > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <Heart className="h-3 w-3 mr-1 fill-current text-red-400" />
                {book.hearts_count.count}{" "}
                {book.hearts_count.count === 1 ? "me gusta" : "me gusta"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
