import { Separator } from "@/components/ui/separator";
import {
  Hash,
  Building,
  Calendar,
  BookOpen,
  MapPin,
  FileText,
} from "lucide-react";
import type { BookWithRelations, BookInfoItemProps } from "../types/book-types";

function BookInfoItem({
  icon: Icon,
  label,
  value,
  className,
}: BookInfoItemProps) {
  return (
    <div className={`flex items-center ${className || ""}`}>
      <Icon className="h-4 w-4 mr-3 text-gray-400" />
      <div>
        <span className="text-sm text-gray-500">{label}</span>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

interface BookDetailsProps {
  book: BookWithRelations;
}

export function BookDetails({ book }: BookDetailsProps) {
  return (
    <>
      {book.description && (
        <>
          <Separator className="my-6" />
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Descripción
            </h3>
            <p className="text-gray-700 leading-relaxed">{book.description}</p>
          </div>
        </>
      )}

      <Separator className="my-6" />

      <div>
        <h3 className="text-lg font-semibold mb-4">Información del libro</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {book.isbn && (
            <BookInfoItem icon={Hash} label="ISBN" value={book.isbn} />
          )}
          {book.publisher && (
            <BookInfoItem
              icon={Building}
              label="Editorial"
              value={book.publisher}
            />
          )}
          {book.publication_year && (
            <BookInfoItem
              icon={Calendar}
              label="Año de publicación"
              value={book.publication_year.toString()}
            />
          )}
          {book.pages && (
            <BookInfoItem
              icon={BookOpen}
              label="Páginas"
              value={book.pages.toString()}
            />
          )}
          {book.location && (
            <BookInfoItem
              icon={MapPin}
              label="Ubicación en biblioteca"
              value={book.location}
              className="md:col-span-2"
            />
          )}
        </div>
      </div>
    </>
  );
}
