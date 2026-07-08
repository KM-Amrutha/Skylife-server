import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { sendResponse } from "@shared/utils/http.response";
import { StatusCodes } from "@shared/constants/index.constants";
import { IAddMoneyToProviderWalletUseCase } from "@di/file-imports-index";
import { TYPES_WALLET_USECASES } from "@di/types-usecases";

@injectable()
export class AddMoneyToProviderWalletController {
  constructor(
    @inject(TYPES_WALLET_USECASES.AddMoneyToProviderWalletUseCase)
    private readonly _useCase: IAddMoneyToProviderWalletUseCase,
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    const providerId = req.user!.id;
    const result = await this._useCase.execute(providerId, req.body);
    sendResponse(res, "Money added to wallet", result, StatusCodes.OK);
  }
}