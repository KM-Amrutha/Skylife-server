import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { sendResponse } from "@shared/utils/http.response";
import { StatusCodes } from "@shared/constants/index.constants";
import { IGetAircraftSeatsUseCase } from "@di/file-imports-index";
import { TYPES_AIRCRAFT_USECASES } from "@di/types-usecases";
import { AIRCRAFT_MESSAGES } from "@shared/constants/aircraftMessages/aircraft.messages";

@injectable()
export class GetAircraftSeatsController {
  constructor(
    @inject(TYPES_AIRCRAFT_USECASES.GetAircraftSeatsUseCase)
    private readonly _getAircraftSeatsUseCase: IGetAircraftSeatsUseCase
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    const providerId = req.user!.id;
    const { aircraftId } = req.params;
    if(!aircraftId) {
      sendResponse(res, "Aircraft ID is required", null, StatusCodes.BAD_REQUEST);
      return;
    }

    const seats = await this._getAircraftSeatsUseCase.execute(aircraftId, providerId);
    sendResponse(res,
         AIRCRAFT_MESSAGES.AIRCRAFT_SEATS_RETRIEVED,
          seats,
         StatusCodes.OK);
  }
}