import { ppaRepository } from "@/data/ppa";
import { ROLE } from "@/generated/prisma";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/utils/error";

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

  async createPPA(userRole: ROLE, data: Parameters<typeof ppaRepository.create>[0]) {
    if (userRole !== ROLE.SUPER_ADMIN) {
      throw new ForbiddenError("Only SUPER_ADMIN can create PPA");
    }

    if (!data.task || !data.sectorId || !data.implementingUnitId) {
      throw new BadRequestError("Missing required fields");
    }

    return ppaRepository.create(data);
  },

  async updatePPA(userRole: ROLE, id: string, data: any) {
    const existing = await this.getPPAById(id);

    if (userRole !== ROLE.SUPER_ADMIN && userRole !== ROLE.ADMIN) {
      throw new ForbiddenError("You are not allowed to update this PPA");
    }

    return ppaRepository.update(id, data);
  },

  async deletePPA(userRole: ROLE, id: string) {
    if (userRole !== ROLE.SUPER_ADMIN) {
      throw new ForbiddenError("Only SUPER_ADMIN can delete PPA");
    }

    await this.getPPAById(id);
    return ppaRepository.delete(id);
  },
};
