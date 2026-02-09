import { ppaRepository } from "@/data/ppa";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/utils/error";
import { remindReschedulePPA } from "./notificationService";
import { venueService } from "@/services/venue";
import { dateTime } from "@/utils/dates";

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

    const existingStartDate = dateTime.parse(existing.startDate);
    const newStartDate = data.startDate ? dateTime.parse(data.startDate) : null;
    const existingDueDate = dateTime.parse(existing.dueDate);
    const newDueDate = data.dueDate ? dateTime.parse(data.dueDate) : null;

    const startDateChanged = 
      newStartDate && !existingStartDate.isSame(newStartDate);
    const dueDateChanged = 
      newDueDate && !existingDueDate.isSame(newDueDate);

    if (startDateChanged || dueDateChanged) {
      let scheduleMessage = "The PPA has been rescheduled.";
      
      if (startDateChanged && dueDateChanged) {
        scheduleMessage = `New schedule: ${dateTime.formatDateTime(data.startDate)} to ${dateTime.formatDateTime(data.dueDate)}`;
      } else if (startDateChanged) {
        scheduleMessage = `New start time: ${dateTime.formatDateTime(data.startDate)}`;
      } else if (dueDateChanged) {
        scheduleMessage = `New end time: ${dateTime.formatDateTime(data.dueDate)}`;
      }

      const title = "📅 PPA Rescheduled";
      const body = `Reminder: "${updatedPPA.task}" has been rescheduled. ${scheduleMessage}`;
      
      await remindReschedulePPA({
        ppaId,
        pushToken: updatedPPA?.user?.pushToken as string,
        title,
        body,
      });
      
      console.log(`✅ Reschedule notification sent for PPA: ${updatedPPA.task}`);
    }

    return updatedPPA;
  },

  async deletePPA(userId: string, ppaId: string) {
    await this.getPPAById(ppaId);

    return ppaRepository.delete(userId, ppaId);
  },
};