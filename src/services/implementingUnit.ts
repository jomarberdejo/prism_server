import { implementingUnitRepository } from "@/data/implementingUnit";
import { sectorRepository } from "@/data/sector";
import { userRepository } from "@/data/user";
import { NotFoundError, BadRequestError, ConflictError } from "@/utils/error";

export const implementingUnitService = {
  async getAllImplementingUnits() {
    return implementingUnitRepository.findAll();
  },

  async getImplementingUnitById(id: string) {
    const unit = await implementingUnitRepository.findById(id);
    if (!unit) {
      throw new NotFoundError("Implementing unit not found");
    }
    return unit;
  },

  async getImplementingUnitsBySectorId(sectorId: string) {
    const sector = await sectorRepository.findById(sectorId);
    if (!sector) {
      throw new NotFoundError("Sector not found");
    }

    return implementingUnitRepository.findBySectorId(sectorId);
  },

  async getImplementingUnitByUserId(userId: string) {
    const unit = await implementingUnitRepository.findByUserId(userId);
    if (!unit) {
      throw new NotFoundError("No implementing unit assigned to this user");
    }
    return unit;
  },

  async createImplementingUnit(name: string, userId: string, sectorId: string) {
    if (!name || !userId || !sectorId) {
      throw new BadRequestError("Name, userId, and sectorId are required");
    }

    const existingUnit = await implementingUnitRepository.findByName(name);
    if (existingUnit) {
      throw new ConflictError(
        "Implementing unit with this name already exists",
      );
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const existingDeptHead =
      await implementingUnitRepository.findByUserId(userId);
    if (existingDeptHead) {
      throw new ConflictError("User is already assigned as a department head");
    }

    const sector = await sectorRepository.findById(sectorId);
    if (!sector) {
      throw new NotFoundError("Sector not found");
    }

    await userRepository.updateDepartmentHeadStatus(userId, true);

    return implementingUnitRepository.create(name, userId, sectorId);
  },

  async updateImplementingUnit(
    id: string,
    name: string,
    userId: string,
    sectorId: string,
  ) {
    if (!name || !userId || !sectorId) {
      throw new BadRequestError("Name, userId, and sectorId are required");
    }

    const unit = await implementingUnitRepository.findById(id);
    if (!unit) {
      throw new NotFoundError("Implementing unit not found");
    }

    const existingUnit = await implementingUnitRepository.findByName(name);
    if (existingUnit && existingUnit.id !== id) {
      throw new ConflictError(
        "Implementing unit with this name already exists",
      );
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    console.log("USER ID", userId);

    if (unit.userId !== userId) {
      const existingDeptHead =
        await implementingUnitRepository.findByUserId(userId);
      if (existingDeptHead && existingDeptHead.id !== id) {
        throw new ConflictError(
          "User is already assigned as a department head",
        );
      }

      await userRepository.updateDepartmentHeadStatus(unit.userId, false);

      await userRepository.updateDepartmentHeadStatus(userId, true);
    }

    const sector = await sectorRepository.findById(sectorId);
    if (!sector) {
      throw new NotFoundError("Sector not found");
    }

    return implementingUnitRepository.update(id, name, userId, sectorId);
  },

  async deleteImplementingUnit(id: string) {
    const unit = await implementingUnitRepository.findById(id);
    if (!unit) {
      throw new NotFoundError("Implementing unit not found");
    }

    if (unit._count.PPA > 0) {
      throw new BadRequestError(
        "Cannot delete implementing unit with existing PPAs",
      );
    }

    await userRepository.updateDepartmentHeadStatus(unit.userId, false);

    return implementingUnitRepository.delete(id);
  },

  async changeDepartmentHead(id: string, newUserId: string) {
    const unit = await implementingUnitRepository.findById(id);
    if (!unit) {
      throw new NotFoundError("Implementing unit not found");
    }

    const newUser = await userRepository.findById(newUserId);
    if (!newUser) {
      throw new NotFoundError("User not found");
    }

    const existingDeptHead =
      await implementingUnitRepository.findByUserId(newUserId);
    if (existingDeptHead && existingDeptHead.id !== id) {
      throw new ConflictError("User is already assigned as a department head");
    }

    await userRepository.updateDepartmentHeadStatus(unit.userId, false);

    await userRepository.updateDepartmentHeadStatus(newUserId, true);

    return implementingUnitRepository.updateDepartmentHead(id, newUserId);
  },
};
