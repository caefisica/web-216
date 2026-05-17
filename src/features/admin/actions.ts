"use server";

import { z } from "zod";
import { protectedAction } from "@/features/auth/protected-action";
import { getAdminCounts, listPendingBorrowRequests, listBorrowHistory } from "./repository";
import { getDetailedAdminStatsService, updateBorrowStatusService } from "./service";

const BorrowStatusSchema = z.object({
  requestId: z.uuid(),
  status: z.enum(["approved", "rejected"]),
});

export const getAdminStats = protectedAction(z.void(), ["librarian", "admin"], async () => {
  return getAdminCounts();
});

export const getPendingBorrowRequests = protectedAction(
  z.void(),
  ["librarian", "admin"],
  async () => {
    return listPendingBorrowRequests();
  },
);

export const getDetailedAdminStats = protectedAction(z.void(), ["librarian", "admin"], async () => {
  return getDetailedAdminStatsService();
});

export const getBorrowingHistory = protectedAction(
  z.object({ limit: z.number().default(50) }),
  ["librarian", "admin"],
  async ({ limit }) => listBorrowHistory(limit),
);

export const updateBorrowStatus = protectedAction(
  BorrowStatusSchema,
  ["librarian", "admin"],
  async ({ requestId, status }, session) => {
    return updateBorrowStatusService(requestId, status, session.user.id);
  },
);
