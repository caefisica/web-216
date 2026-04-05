import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBookById, getCategories } from "@/lib/actions/books";
import BookClient from "./book-client";
import { NotFoundState } from "./components/not-found-state";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const [book, categories] = await Promise.all([getBookById(id), getCategories()]);

  if (!book) {
    return <NotFoundState />;
  }

  return <BookClient initialBook={book} categories={categories} user={session?.user} />;
}
