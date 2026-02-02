import { implementingUnitRepository } from "@/data/implementingUnit";
import { sectorRepository } from "@/data/sector";
import { NotFoundError, BadRequestError, ConflictError } from "@/utils/error";

export const sectorService = {
  async getAllSectors() {
    return sectorRepository.findAll();
  },

  async getSectorById(id: string) {
    const sector = await sectorRepository.findById(id);
    if (!sector) {
      throw new NotFoundError("Sector not found");
    }
    return sector;
  },

  async createSector(name: string, description: string) {
    const existingSector = await sectorRepository.findByName(name);
    if (existingSector) {
      throw new ConflictError("Sector with this name already exists");
    }

    return sectorRepository.create(name, description);
  },

  async updateSector(id: string, name: string, description: string) {
    const sector = await sectorRepository.findById(id);
    if (!sector) {
      throw new NotFoundError("Sector not found");
    }

    const existingSector = await sectorRepository.findByName(name);
    if (existingSector && existingSector.id !== id) {
      throw new ConflictError("Sector with this name already exists");
    }

    return sectorRepository.update(id, name, description);
  },

  async deleteSector(id: string) {
    const sector = await sectorRepository.findById(id);
    if (!sector) {
      throw new NotFoundError("Sector not found");
    }

    return sectorRepository.delete(id);
  },

  async getSectorStats(id: string) {
    const sector = await sectorRepository.getSectorWithStats(id);
    if (!sector) {
      throw new NotFoundError("Sector not found");
    }
    return sector;
  },
};
