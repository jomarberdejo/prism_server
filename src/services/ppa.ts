import { ppaRepository } from "@/data/ppa";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/utils/error";
import { remindReschedulePPA } from "./notificationService";
import { venueService } from "@/services/venue";

export const ppaService = {
  async getPPAById(id: string) {
    const ppa = await ppaRepository.findById(id);
    if (!ppa) throw new NotFoundError("PPA not found");
    return ppa;
  },

  async getAllPPAs() {
    const ppas = await ppaRepository.findAll();

    const mappedPPA = ppas.map((ppa) => ({
      ...ppa,
      attendees: ppa.attendees.map((attendee) => ({
        label: attendee.name,
        value: attendee.id,
      })),
    }));

    return mappedPPA;
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

    const availability = await venueService.checkLocationAvailability(
      data.startDate,
      data.dueDate,
      undefined,
      data.venue
    );
    if (!availability.available) {
      throw new ForbiddenError(
        `Venue is not available: ${data.venue} is already occupied for the selected dates.`
      );
    }

    return ppaRepository.create(data);
  },

  async updatePPA(ppaId: string, data: any, userId: string) {
    
    const existing = await this.getPPAById(ppaId);

    const availability = await venueService.checkLocationAvailability(
      data.startDate,
      data.dueDate,
      ppaId,
      data.venue
    );
    if (!availability.available) {
      throw new ForbiddenError(
        `Venue is not available: ${data.venue} is already occupied for the selected dates.`
      );
    }

    const updatedPPA = await ppaRepository.update(ppaId, data, userId);

    const startDateChanged = data.startDate && new Date(existing.startDate).getTime() !== new Date(data.startDate).getTime();
    const dueDateChanged = data.dueDate && new Date(existing.dueDate).getTime() !== new Date(data.dueDate).getTime();

    if (startDateChanged || dueDateChanged) {
      const title = "PPA Rescheduled Notification";
      const body = `Reminder: The PPA "${updatedPPA.task}" has been rescheduled. Please check the new schedule. Thank you!`;
      await remindReschedulePPA({
        ppaId,
        pushToken: updatedPPA?.user?.pushToken as string,
        title,
        body,
      });
      console.log("Reschedule notification sent.");
    }

    return updatedPPA;
  },

  async deletePPA(userId: string, ppaId: string) {
    await this.getPPAById(ppaId);

    return ppaRepository.delete(userId, ppaId);
  },
};