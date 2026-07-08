import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { sendResponse } from "@shared/utils/http.response";
import { AUTH_MESSAGES, StatusCodes } from "@shared/constants/index.constants";
import { TYPES_AUTH_USECASES } from "@di/types-usecases";
import { CreateProviderUseCase } from '@di/file-imports-index';
import { CreateProviderDTO } from '@application/dtos/provider-dtos';

@injectable()
export class SignUpProviderController {
  constructor(
    @inject(TYPES_AUTH_USECASES.CreateProviderUseCase)
    private _createProviderUseCase: CreateProviderUseCase
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    const mappedData: CreateProviderDTO = {
      companyName: req.body.companyName,
      email: req.body.email,
      mobile: req.body.mobile,
      password: req.body.password,
      airlineCode: req.body.airlineCode,
    };
    const result = await this._createProviderUseCase.execute(mappedData);
    sendResponse(res, AUTH_MESSAGES.PROVIDER_CREATED, result, StatusCodes.OK);
  }
}