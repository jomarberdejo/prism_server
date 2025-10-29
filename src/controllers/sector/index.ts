
import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "@/utils/error";
import { sectorService } from "@/services/sector";

export const sectorHandler = {
  async getAll(c: Context) {
    const sectors = await sectorService.getAllSectors();
    return c.json(
      {
        success: true,
        data: { sectors },
      },
      StatusCodes.OK
    );
  },

  async getById(c: Context) {
    const id = c.req.param("id");
    const sector = await sectorService.getSectorById(id);

    return c.json(
      {
        success: true,
        data: { sector },
      },
      StatusCodes.OK
    );
  },

  async create(c: Context) {
    const { name, description } = await c.req.json();

    if (!name || !description) {
      throw new BadRequestError("Name and description are required");
    }

    const sector = await sectorService.createSector(name, description);

    return c.json(
      {
        success: true,
        message: "Sector created successfully",
        data: { sector },
      },
      StatusCodes.CREATED
    );
  },

  async update(c: Context) {
    const id = c.req.param("id");
    const { name, description } = await c.req.json();

    if (!name || !description) {
      throw new BadRequestError("Name and description are required");
    }

    const sector = await sectorService.updateSector(id, name, description);

    return c.json(
      {
        success: true,
        message: "Sector updated successfully",
        data: { sector },
      },
      StatusCodes.OK
    );
  },

  async delete(c: Context) {
    const id = c.req.param("id");
    await sectorService.deleteSector(id);

    return c.json(
      {
        success: true,
        message: "Sector deleted successfully",
      },
      StatusCodes.OK
    );
  },

  async getStats(c: Context) {
    const id = c.req.param("id");
    const stats = await sectorService.getSectorStats(id);

    return c.json(
      {
        success: true,
        data: { stats },
      },
      StatusCodes.OK
    );
  },
};


