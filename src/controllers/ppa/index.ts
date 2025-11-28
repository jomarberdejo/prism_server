import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, ConflictError } from "@/utils/error";
import { ppaService } from "@/services/ppa";
import { venueService } from "@/services/venue";

export const ppaHandler = {
  async getAll(c: Context) {
    const ppas = await ppaService.getAllPPAs();
    return c.json(
      {
        success: true,
        data: { ppas },
      },
      StatusCodes.OK
    );
  },

  async getAllArchivedPPA(c: Context) {
    const ppas = await ppaService.getAllArchived();
    return c.json(
      {
        success: true,
        data: { ppas },
      },
      StatusCodes.OK
    );
  },

  async getById(c: Context) {
    const id = c.req.param("id");
    if (!id) throw new BadRequestError("Missing PPA ID");

    const ppa = await ppaService.getPPAById(id);
    return c.json(
      {
        success: true,
        data: { ppa },
      },
      StatusCodes.OK
    );
  },

  async getBySector(c: Context) {
    const sectorId = c.req.param("sectorId");
    if (!sectorId) throw new BadRequestError("Missing Sector ID");

    const ppas = await ppaService.getPPAsBySector(sectorId);
    return c.json(
      {
        success: true,
        data: { ppas },
      },
      StatusCodes.OK
    );
  },

  async getByImplementingUnit(c: Context) {
    const implementingUnitId = c.req.param("implementingUnitId");
    if (!implementingUnitId)
      throw new BadRequestError("Missing Implementing Unit ID");

    const ppas = await ppaService.getPPAsByImplementingUnit(implementingUnitId);
    return c.json(
      {
        success: true,
        data: { ppas },
      },
      StatusCodes.OK
    );
  },

  async checkAvailability(c: Context) {
    const body = await c.req.json();

    if (!body.startDate || !body.dueDate) {
      throw new BadRequestError("Start date and due date are required");
    }

    const { startDate, dueDate, excludePPAId } = body;

    const result = await venueService.checkLocationAvailability(
      new Date(startDate),
      new Date(dueDate),
      excludePPAId,
      body.venue
    );

    return c.json(
      {
        success: true,
        data: {
          available: result.available,
          conflictingPPAs: result.conflictingPPAs,
          message:
            result.conflictingPPAs.length === 0
              ? "No PPAs scheduled in this date range"
              : `${result.conflictingPPAs.length} PPA(s) scheduled in this date range`,
        },
      },
      StatusCodes.OK
    );
  },

  async create(c: Context) {
    const user = c.get("user");
    const body = await c.req.json();

    const requiredFields = [
      "task",
      "description",
      "address",
      "startDate",
      "dueDate",
      "startTime",
      "dueTime",
      "budgetAllocation",
      "approvedBudget",
      "sectorId",
      "implementingUnitId",
    ];

    for (const field of requiredFields) {
      if (!body[field]) throw new BadRequestError(`Missing field: ${field}`);
    }

    const newPPA = await ppaService.createPPA({
      task: body.task,
      description: body.description,
      address: body.address,
      venue: body.venue,
      expectedOutput: body.expectedOutput,
      startDate: new Date(body.startDate),
      dueDate: new Date(body.dueDate),
      startTime: new Date(body.startTime),
      dueTime: new Date(body.dueTime),
      sectorId: body.sectorId,
      budgetAllocation: body.budgetAllocation,
      approvedBudget: body.approvedBudget,
      implementingUnitId: body.implementingUnitId,
      userId: user.id,
    });

    return c.json(
      {
        success: true,
        message: "PPA created successfully",
        data: { ppa: newPPA },
      },
      StatusCodes.CREATED
    );
  },

  async update(c: Context) {
    const user = c.get("user");
    const id = c.req.param("id");
    const data = await c.req.json();

    if (!id) throw new BadRequestError("Missing PPA ID");

    const updated = await ppaService.updatePPA(id, data, user.id);

    return c.json(
      {
        success: true,
        message: "PPA rescheduled successfully",
        data: updated,
      },
      StatusCodes.OK
    );
  },

  async delete(c: Context) {
    const user = c.get("user");
    const id = c.req.param("id");

    if (!id) throw new BadRequestError("Missing PPA ID");

    await ppaService.deletePPA(user.id, id);

    return c.json(
      {
        success: true,
        message: "PPA deleted successfully",
      },
      StatusCodes.OK
    );
  },
};
