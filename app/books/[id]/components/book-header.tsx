"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, User } from "lucide-react";
import type { BookWithRelations } from "../types/book-types";

interface BookHeaderProps {
  book: BookWithRelations;
  canEdit: boolean;
  isEditing: boolean;
  onToggleEditing: () => void;
}

export function BookHeader({
  book,
  canEdit,
  isEditing,
  onToggleEditing,
}: BookHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div className="flex-1">
        <h1 className="text-3xl font-bold tracking-tight mb-3">{book.title}</h1>
        <div className="flex items-center text-lg text-gray-600 mb-4">
          <User className="h-5 w-5 mr-2" />
          {book.author}
        </div>
        {book.category && (
          <Badge variant="secondary" className="mb-4">
            {book.category.name}
          </Badge>
        )}
      </div>
      {canEdit && (
        <Button variant="outline" onClick={onToggleEditing}>
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? "Cancelar" : "Editar"}
        </Button>
      )}
    </div>
  );
}
