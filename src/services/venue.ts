import { ppaRepository } from "@/data/ppa";

export const venueService = {
  async checkLocationAvailability(
    startDate: Date,
    dueDate: Date,
    excludePPAId?: string,
    venue?: string,
  ) {
    const ppas = await ppaRepository.findOverlappingPPAs(
      startDate,
      dueDate,
      excludePPAId,
      venue,
    );

    const conflictingPPAs = ppas.map((ppa) => ({
      id: ppa.id,
      task: ppa.task,
      description: ppa.description,
      startDate: ppa.startDate,
      dueDate: ppa.dueDate,
      startTime: ppa.startTime,
      dueTime: ppa.dueTime,
      venue: ppa.venue,
      sector: ppa.sector,
      implementingUnit: ppa.implementingUnit,
    }));

    return {
      available: conflictingPPAs.length === 0,
      conflictingPPAs,
    };
  },
};
