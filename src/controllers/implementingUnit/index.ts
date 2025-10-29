

import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "@/utils/error";
import { implementingUnitService } from "@/services/implementingUnit";

export const implementingUnitHandler = {
  async getAll(c: Context) {
    const units = await implementingUnitService.getAllImplementingUnits();
    return c.json(
      {
        success: true,
        data: { implementingUnits: units },
      },
      StatusCodes.OK
    );
  },

  async getById(c: Context) {
    const id = c.req.param("id");
    const unit = await implementingUnitService.getImplementingUnitById(id);

    return c.json(
      {
        success: true,
        data: { implementingUnit: unit },
      },
      StatusCodes.OK
    );
  },

  async getBySectorId(c: Context) {
    const sectorId = c.req.param("sectorId");
    const units = await implementingUnitService.getImplementingUnitsBySectorId(
      sectorId
    );

    return c.json(
      {
        success: true,
        data: { implementingUnits: units },
      },
      StatusCodes.OK
    );
  },

  async getByUserId(c: Context) {
    const userId = c.req.param("userId");
    const unit = await implementingUnitService.getImplementingUnitByUserId(
      userId
    );

    return c.json(
      {
        success: true,
        data: { implementingUnit: unit },
      },
      StatusCodes.OK
    );
  },

  async create(c: Context) {
    const { name, userId, sectorId } = await c.req.json();

    if (!name || !userId || !sectorId) {
      throw new BadRequestError("Name, userId, and sectorId are required");
    }

    const unit = await implementingUnitService.createImplementingUnit(
      name,
      userId,
      sectorId
    );

    return c.json(
      {
        success: true,
        message: "Implementing unit created successfully",
        data: { implementingUnit: unit },
      },
      StatusCodes.CREATED
    );
  },

  async update(c: Context) {
    const id = c.req.param("id");
    const { name, userId, sectorId } = await c.req.json();

    if (!name || !userId || !sectorId) {
      throw new BadRequestError("Name, userId, and sectorId are required");
    }

    const unit = await implementingUnitService.updateImplementingUnit(
      id,
      name,
      userId,
      sectorId
    );

    return c.json(
      {
        success: true,
        message: "Implementing unit updated successfully",
        data: { implementingUnit: unit },
      },
      StatusCodes.OK
    );
  },

  async delete(c: Context) {
    const id = c.req.param("id");
    await implementingUnitService.deleteImplementingUnit(id);

    return c.json(
      {
        success: true,
        message: "Implementing unit deleted successfully",
      },
      StatusCodes.OK
    );
  },

  async changeDepartmentHead(c: Context) {
    const id = c.req.param("id");
    const { userId } = await c.req.json();

    if (!userId) {
      throw new BadRequestError("userId is required");
    }

    const unit = await implementingUnitService.changeDepartmentHead(id, userId);

    return c.json(
      {
        success: true,
        message: "Department head changed successfully",
        data: { implementingUnit: unit },
      },
      StatusCodes.OK
    );
  },
};