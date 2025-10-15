import { ROLE } from "@/generated/prisma";
import { userService } from "@/services/user";
import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";

export const userHandler = {
  async getAll(c: Context) {
    const users = await userService.getAllUsers();
    return c.json(
      {
        success: true,
        data: { users },
      },
      StatusCodes.OK
    );
  },

  async getById(c: Context) {
    const id = c.req.param("id");
    const user = await userService.getUserById(id);

    return c.json(
      {
        success: true,
        data: { user },
      },
      StatusCodes.OK
    );
  },

  async getByRole(c: Context) {
    const role = c.req.param("role") as ROLE;
    const users = await userService.getUsersByRole(role);

    return c.json(
      {
        success: true,
        data: { users },
      },
      StatusCodes.OK
    );
  },

  async updateRole(c: Context) {
    const id = c.req.param("id");
    const { role } = await c.req.json();

    const user = await userService.updateUserRole(id, role);

    return c.json(
      {
        success: true,
        message: "Role updated successfully",
        data: { user },
      },
      StatusCodes.OK
    );
  },

  async delete(c: Context) {
    const id = c.req.param("id");
    await userService.deleteUser(id);

    return c.json(
      {
        success: true,
        message: "User deleted successfully",
      },
      StatusCodes.OK
    );
  },
};
