import { revalidatePath } from "next/cache";
import { updateUserName, setUserRole } from "./repository";

export async function updateUserProfileService(userId: string, name?: string) {
  const user = await updateUserName(userId, name);
  revalidatePath("/profile");
  return { success: true, user };
}

export async function updateUserRoleService(
  userId: string,
  newRole: "user" | "librarian" | "admin" | "suspended",
) {
  await setUserRole(userId, newRole);
  revalidatePath("/");
  return { success: true, message: `Rol actualizado a ${newRole}` };
}

export async function suspendUserService(userId: string) {
  await setUserRole(userId, "suspended");
  revalidatePath("/");
  return { success: true, message: "Usuario suspendido exitosamente" };
}
