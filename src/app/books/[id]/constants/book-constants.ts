export const BOOK_STATUS_COLORS = {
  available: "bg-green-100 text-green-800 border-green-200",
  borrowed: "bg-red-100 text-red-800 border-red-200",
  maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
  default: "bg-gray-100 text-gray-800 border-gray-200",
} as const;

export const TOAST_MESSAGES = {
  SIGN_IN_REQUIRED: {
    title: "Por favor, inicia sesión",
    variant: "destructive" as const,
  },
  HEART_SIGN_IN: {
    description: "Necesitas iniciar sesión para marcar libros como favoritos.",
  },
  BORROW_SIGN_IN: {
    description: "Necesitas iniciar sesión para solicitar préstamos de libros.",
  },
  REQUEST_SUBMITTED: {
    title: "Solicitud enviada",
    description: "Tu solicitud de préstamo ha sido enviada para revisión.",
  },
  BOOK_UPDATED: {
    title: "Libro actualizado",
    description: "La información del libro se ha actualizado correctamente.",
  },
  ERROR: {
    title: "Error",
    variant: "destructive" as const,
  },
  BORROW_ERROR: {
    description: "Error al enviar la solicitud de préstamo.",
  },
  UPDATE_ERROR: {
    description: "Error al actualizar la información del libro.",
  },
} as const;
