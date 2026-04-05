import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import type { Role } from "@/lib/db/schema";

/**
 * Common session fetcher for server-side logic
 */
export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

/**
 * Higher-order function to create protected server actions with Zod validation and RBAC.
 */
export function protectedAction<TInput extends z.ZodTypeAny, TOutput>(
  schema: TInput,
  allowedRoles: Role[],
  handler: (
    input: z.infer<TInput>,
    session: NonNullable<Awaited<ReturnType<typeof getSession>>>,
  ) => Promise<TOutput>,
) {
  return async (input: z.infer<TInput>): Promise<TOutput> => {
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized: You must be logged in to perform this action.");
    }

    const userRole = (session.user as { role: Role }).role;

    // Admin has superuser access
    const hasAccess = userRole === "admin" || allowedRoles.includes(userRole);

    if (!hasAccess) {
      throw new Error(
        `Forbidden: Role '${userRole}' does not have permission to perform this action.`,
      );
    }

    const validatedInput = schema.parse(input);
    return await handler(
      validatedInput,
      session as NonNullable<Awaited<ReturnType<typeof getSession>>>,
    );
  };
}

/**
 * Simple version for actions that only require a log-in, no specific role.
 */
export function authenticatedAction<TInput extends z.ZodTypeAny, TOutput>(
  schema: TInput,
  handler: (
    input: z.infer<TInput>,
    session: NonNullable<Awaited<ReturnType<typeof getSession>>>,
  ) => Promise<TOutput>,
) {
  return protectedAction(schema, ["user", "librarian", "admin"], handler);
}
