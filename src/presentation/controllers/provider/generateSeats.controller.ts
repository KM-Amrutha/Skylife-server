import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { sendResponse } from "@shared/utils/http.response";
import { AIRCRAFT_MESSAGES,
   StatusCodes,
   SEAT_MESSAGES } from "@shared/constants/index.constants";
import { TYPES_AIRCRAFT_USECASES } from "@di/types-usecases";
import { IGenerateSeatsUseCase } from "@di/file-imports-index";



@injectable()
export class GenerateSeatsController {
  constructor(
    @inject(TYPES_AIRCRAFT_USECASES.GenerateSeatsUseCase)
    private _generateSeatsUseCase: IGenerateSeatsUseCase
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const providerId = req.user!.id;
      const aircraftId = req.params.aircraftId;

      if (!aircraftId) {
        sendResponse(
          res,
          AIRCRAFT_MESSAGES.ID_REQUIRED,
          null,
          StatusCodes.BAD_REQUEST
        );
        return;
      }

      const seats = await this._generateSeatsUseCase.execute(
        providerId,
        aircraftId
      );

      sendResponse(
        res,
        SEAT_MESSAGES.SEATS_GENERATED(seats.length),
        {
          totalSeats: seats.length,
          seats: seats
        },
        StatusCodes.CREATED
      );
    } catch (error: any) {
      sendResponse(
        res,
        error.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }
}
