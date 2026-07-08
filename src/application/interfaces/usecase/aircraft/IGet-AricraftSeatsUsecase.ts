import { SeatDetailsDTO } from "@application/dtos/seat-dtos";

export interface IGetAircraftSeatsUseCase {
  execute(aircraftId: string, providerId: string): Promise<SeatDetailsDTO[]>;
}