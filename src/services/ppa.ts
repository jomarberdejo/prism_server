import { ppaRepository } from "@/data/ppa";
import { ROLE } from "@/generated/prisma";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/utils/error";
import { remindReschedulePPA } from "./notificationService";

export const ppaService = {
  async getPPAById(id: string) {
    const ppa = await ppaRepository.findById(id);
    if (!ppa) throw new NotFoundError("PPA not found");
    return ppa;
  },

  async getAllPPAs() {
    return ppaRepository.findAll();
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

    return ppaRepository.create(data);
  },

  async updatePPA(id: string, data: any) {
    console.log("ID", id);
    const existing = await this.getPPAById(id);

    const updatedPPA = await ppaRepository.update(id, data);
    const title = "PPA Reschuled Notification";
    const body = `Reminder: The PPA ${updatedPPA.task} was rescheduled to ${updatedPPA.startDate} - ${updatedPPA.dueDate} from ${updatedPPA.startTime} - ${updatedPPA.dueTime} `;
    await remindReschedulePPA({
      id,
      title,
      body,
    });

    return updatedPPA;
  },

  async deletePPA(id: string) {
    await this.getPPAById(id);
    return ppaRepository.delete(id);
  },
};
