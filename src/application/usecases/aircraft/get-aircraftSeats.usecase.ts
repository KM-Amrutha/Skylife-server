import { injectable, inject } from "inversify";
import { ISeatRepository } from "@domain/interfaces/ISeatRepository";
import { IAircraftRepository } from "@domain/interfaces/IAircraftRepository";
import { IGetAircraftSeatsUseCase } from "@di/file-imports-index";
import { SeatDetailsDTO } from "@application/dtos/seat-dtos";
import { SeatMapper } from "@application/mappers/seatMapper";
import { NotFoundError, ForbiddenError, validationError } from "@presentation/middlewares/error.middleware";
import { TYPES_AIRCRAFT_REPOSITORIES } from "@di/types-repositories";

@injectable()
export class GetAircraftSeatsUseCase implements IGetAircraftSeatsUseCase {
  constructor(
    @inject(TYPES_AIRCRAFT_REPOSITORIES.SeatRepository)
    private readonly _seatRepository: ISeatRepository,
    @inject(TYPES_AIRCRAFT_REPOSITORIES.AircraftRepository)
    private readonly _aircraftRepository: IAircraftRepository,
  ) {}

  async execute(aircraftId: string, providerId: string): Promise<SeatDetailsDTO[]> {
    if (!aircraftId) throw new validationError("Aircraft ID is required");

    const aircraft = await this._aircraftRepository.getAircraftById(aircraftId);
    if (!aircraft) throw new NotFoundError("Aircraft not found");

    if (aircraft.providerId !== providerId) {
      throw new ForbiddenError("Aircraft does not belong to this provider");
    }

    const seats = await this._seatRepository.getSeatsByAircraftId(aircraftId);
    return SeatMapper.toSeatDTOs(seats);
  }
}