import { ToggleSeatBlockResponseDTO } from "@application/dtos/seat-dtos";

export interface IToggleSeatBlockUseCase {
  execute(
    providerId: string,
    aircraftId: string,
    seatId: string,
    blockReason?: string
  ): Promise<ToggleSeatBlockResponseDTO>;
}