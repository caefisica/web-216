"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Heart, BookOpen } from "lucide-react";
import type { BookDetailed } from "../../books/types";

interface AdminBookCardProps {
  book: BookDetailed;
  onDelete: () => Promise<void>;
  isDeleting?: boolean;
}

export function AdminBookCard({ book, onDelete, isDeleting }: AdminBookCardProps) {
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
        return "Disponible";
      case "borrowed":
        return "Prestado";
      case "maintenance":
        return "En mantenimiento";
      default:
        return status;
    }
  };

  const heartsCount = book.heartsCount || 0;
  const coverImage = book.coverImage || book.images?.[0];
  const imageUrl = coverImage?.imageUrl;

  const categoriesToDisplay = book.categories?.slice(0, 2) || [];
  const remainingCategoriesCount = Math.max(0, (book.categories?.length || 0) - 2);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
      {/* Admin Actions Overlay */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" asChild className="h-8 w-8 p-0">
            <Link href={`/admin/books/${book.id}`}>
              <Edit className="h-3 w-3" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" className="h-8 w-8 p-0">
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar libro</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Está seguro de que desea eliminar &quot;{book.title}&quot;? Esta acción no se
                  puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} disabled={isDeleting}>
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Link href={`/books/${book.id}`} className="block">
        <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={coverImage?.altText || book.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <BookOpen className="h-16 w-16 text-blue-300" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <Badge className={`text-xs font-medium ${getStatusColor(book.status)}`}>
              {getStatusText(book.status)}
            </Badge>
          </div>

          {/* Hearts Count */}
          {heartsCount > 0 && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="text-xs bg-white/90 text-gray-700">
                <Heart className="h-3 w-3 mr-1 fill-red-500 text-red-500" />
                {heartsCount}
              </Badge>
            </div>
          )}

          {/* Multiple Images Indicator */}
          {book.images && book.images.length > 1 && (
            <div className="absolute bottom-2 right-2">
              <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                +{book.images.length - 1}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {book.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-1">{book.author}</p>

            {/* Categories Display */}
            {categoriesToDisplay.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {categoriesToDisplay.map((category) => (
                  <Badge key={category.id} variant="outline" className="text-xs">
                    {category.name}
                  </Badge>
                ))}
                {remainingCategoriesCount > 0 && (
                  <Badge variant="outline" className="text-xs bg-gray-50">
                    +{remainingCategoriesCount}
                  </Badge>
                )}
              </div>
            )}

            {book.publicationYear && (
              <p className="text-xs text-gray-500">Publicado: {book.publicationYear}</p>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
