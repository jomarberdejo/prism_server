import { ppaRepository } from "@/data/ppa";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/utils/error";
import { remindReschedulePPA } from "./notificationService";
import {venueService} from "@/services/venue";

export const ppaService = {
  async getPPAById(id: string) {
    const ppa = await ppaRepository.findById(id);
    if (!ppa) throw new NotFoundError("PPA not found");
    return ppa;
  },

  async getAllPPAs() {
    return ppaRepository.findAll();
  },

  async getAllArchived() {
    return ppaRepository.findAllArchived();
  },

  async getPPAsBySector(sectorId: string) {
    return ppaRepository.findBySector(sectorId);
  },

  async getPPAsByImplementingUnit(implementingUnitId: string) {
    return ppaRepository.findByImplementingUnit(implementingUnitId);
  },

  async createPPA(data: Parameters<typeof ppaRepository.create>[0]) {
    if (!data.task || !data.sectorId || !data.implementingUnitId) {
      throw new BadRequestError("Missing required fields");
    }

    const availability = await venueService.checkLocationAvailability(data.startDate, data.dueDate, undefined, data.venue);
    if (!availability.available) {
      throw new ForbiddenError(`Venue is not available: ${data.venue} is already occupied for the selected dates.`);
    }
    
    return ppaRepository.create(data);
  },

  async updatePPA(ppaId: string, data: any, userId: string) {

    console.log("ID", ppaId);
    // const existing = await this.getPPAById(id);

     const availability = await venueService.checkLocationAvailability(data.startDate, data.dueDate, ppaId, data.venue);
    if (!availability.available) {
      throw new ForbiddenError(`Venue is not available: ${data.venue} is already occupied for the selected dates.`);
    }

    const updatedPPA = await ppaRepository.update(ppaId, data, userId);
    const title = "PPA Reschuled Notification";
    const body = `Reminder: The PPA "${updatedPPA.task}" has been rescheduled. Please check the new schedule. Thank you!`;
    await remindReschedulePPA({
      ppaId,
      title,
      body,
    });
    return updatedPPA;
  },

  async deletePPA(userId: string, ppaId: string) {
    await this.getPPAById(ppaId);
    
    return ppaRepository.delete(userId, ppaId);
  },
};
