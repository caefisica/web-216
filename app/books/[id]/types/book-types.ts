export interface BookFormData {
  title?: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  publicationYear?: number | string;
  pages?: number | string;
  status?: string;
  location?: string;
  description?: string;
  categoryId?: string;
}

export interface BookInfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
}
