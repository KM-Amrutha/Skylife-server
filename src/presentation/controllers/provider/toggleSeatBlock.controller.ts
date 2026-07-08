import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { sendResponse } from "@shared/utils/http.response";
import { StatusCodes } from "@shared/constants/index.constants";
import { IToggleSeatBlockUseCase } from "@di/file-imports-index";
import { TYPES_AIRCRAFT_USECASES } from "@di/types-usecases";

@injectable()
export class ToggleSeatBlockController {
  constructor(
    @inject(TYPES_AIRCRAFT_USECASES.ToggleSeatBlockUseCase)
    private readonly _toggleSeatBlockUseCase: IToggleSeatBlockUseCase
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    const providerId = req.user!.id;
    const { aircraftId, seatId } = req.params;
    const { blockReason } = req.body;
   
     if (!aircraftId) {
      sendResponse(
        res,
        "Aircraft ID is required",
        null,
        StatusCodes.BAD_REQUEST
      );
      return;
    }
     if (!seatId) {
      sendResponse(
        res,    

    "Seat ID is required",
        null,
        StatusCodes.BAD_REQUEST );
    return };

    const result = await this._toggleSeatBlockUseCase.execute(
      providerId,
      aircraftId,
      seatId,
      blockReason
    );

    sendResponse(res, "Seat block status updated", result, StatusCodes.OK);
  }
}