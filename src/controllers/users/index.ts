import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import { getAllUsers as getAllUsersData, deleteUserById } from "@/data/user";
import { fetchUserById, updateUserRoleService } from "@/services/user";
import { BadRequestError } from "@/utils/error";

export const getAllUsers = async (c: Context) => {
  const users = await getAllUsersData();
  return c.json(users, StatusCodes.OK);
};

export const getUserById = async (c: Context) => {
  const { id } = c.req.param();
  if (!id) {
    throw new BadRequestError("User ID is required");
  }
  const user = await fetchUserById(id);
  return c.json(user, StatusCodes.OK);
};

export const updateUserRole = async (c: Context) => {
  const { id } = c.req.param();
  const { role } = await c.req.json();

  if (!id) {
    throw new BadRequestError("User ID is required");
  }

  const user = await updateUserRoleService(id, role);
  return c.json(user, StatusCodes.OK);
};

export const deleteUser = async (c: Context) => {
  const { id } = c.req.param();
  if (!id) {
    throw new BadRequestError("User ID is required");
  }
  await deleteUserById(id);
  return c.json({ message: "User deleted successfully" }, StatusCodes.OK);
};
