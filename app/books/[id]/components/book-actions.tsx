"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, BookOpen } from "lucide-react";
import type { BookWithRelations } from "../types/book-types";

interface BookActionsProps {
  book: BookWithRelations;
  isHearted: boolean;
  heartsCount: number;
  onHeart: () => void;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  borrowNote: string;
  setBorrowNote: (note: string) => void;
  borrowing: boolean;
  onBorrowRequest: () => void;
}

export function BookActions({
  book,
  isHearted,
  heartsCount,
  onHeart,
  dialogOpen,
  setDialogOpen,
  borrowNote,
  setBorrowNote,
  borrowing,
  onBorrowRequest,
}: BookActionsProps) {
  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        onClick={onHeart}
        className={`w-full ${isHearted ? "text-red-500 border-red-200" : ""}`}
      >
        <Heart className={`h-4 w-4 mr-2 ${isHearted ? "fill-current" : ""}`} />
        {isHearted ? "Te gusta" : "Me gusta"} ({heartsCount})
      </Button>

      {book.status === "available" && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              Solicitar préstamo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request to Borrow</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="note">Nota (opcional)</Label>
                <Textarea
                  id="note"
                  placeholder="Cualquier nota adicional para el bibliotecario..."
                  value={borrowNote}
                  onChange={(e) => setBorrowNote(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button
                onClick={onBorrowRequest}
                disabled={borrowing}
                className="w-full"
              >
                {borrowing ? "Enviando..." : "Enviar solicitud"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
