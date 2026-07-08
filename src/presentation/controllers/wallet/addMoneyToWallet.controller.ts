import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { sendResponse } from "@shared/utils/http.response";
import { StatusCodes } from "@shared/constants/index.constants";
import { IAddMoneyToWalletUseCase } from "@di/file-imports-index";
import { TYPES_WALLET_USECASES } from "@di/types-usecases";

@injectable()
export class AddMoneyToWalletController {
  constructor(
    @inject(TYPES_WALLET_USECASES.AddMoneyToWalletUseCase)
    private readonly _useCase: IAddMoneyToWalletUseCase,
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await this._useCase.execute(userId, req.body);
    sendResponse(res, "Money added to wallet", result, StatusCodes.OK);
  }
}