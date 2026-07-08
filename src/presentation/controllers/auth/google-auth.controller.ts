import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { sendResponse } from "@shared/utils/http.response";
import { AUTH_MESSAGES, StatusCodes } from "@shared/constants/index.constants";
import { GoogleAuthUseCase } from "@di/file-imports-index";
import { setAuthCookies } from "@shared/utils/cookie";
import { TYPES_AUTH_USECASES } from "@di/types-usecases";

@injectable()
export class GoogleAuthController {
  constructor(
    @inject(TYPES_AUTH_USECASES.GoogleAuthUseCase)
    private googleAuthUseCase: GoogleAuthUseCase
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      sendResponse(res, "Invalid Google credential", null, StatusCodes.BAD_REQUEST);
      return;
    }

    const { userData, accessToken, refreshToken } =
      await this.googleAuthUseCase.execute({ token });

    setAuthCookies(res, accessToken, refreshToken);

    // match signinUser shape — "userData" key, no accessToken in body
    sendResponse(
      res,
      AUTH_MESSAGES.LOGIN_SUCCESS,
      { userData },
      StatusCodes.OK
    );
  }
}