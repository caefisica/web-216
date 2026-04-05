export function NotFoundState() {
  return (
    <div className="container mx-auto px-6 py-8 text-center">
      <h1 className="text-2xl font-bold">Book not found</h1>
      <p className="text-gray-600 mt-2">
        The book you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
    </div>
  );
}
