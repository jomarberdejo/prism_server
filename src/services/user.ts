
import { getUserById as getUserByIdData, updateUserRole as updateUserRoleData } from "@/data/user";
import { ROLE } from "@/generated/prisma";
import { NotFoundError, BadRequestError } from "@/utils/error";

const VALID_ROLES = ["SUPER_ADMIN", "ADMIN", "VIEWER", "EDITOR"] as const;

export const fetchUserById = async (id: string) => {
  const user = await getUserByIdData(id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};

export const updateUserRoleService = async (id: string, role: ROLE) => {
  if (!VALID_ROLES.includes(role)) {
    throw new BadRequestError("Invalid role");
  }

  const user = await fetchUserById(id);

  return updateUserRoleData(id, role);
};
