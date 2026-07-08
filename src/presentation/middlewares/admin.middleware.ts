import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { JWT_MESSAGES } from "@shared/constants/index.constants";
import { UnauthorizedError } from "./error.middleware";
import { tokenUseCase } from "@di/container-resolver";

export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    next(new UnauthorizedError(JWT_MESSAGES.NO_ACCESS_TOKEN));
    return;
  }
  try {
    const decoded = await tokenUseCase.authAccessToken(accessToken);
    req.user = decoded as JwtPayload & { id: string; role: string; email: string };
    next();
  } catch (error: any) {
    next(new UnauthorizedError(JWT_MESSAGES.NO_ACCESS_TOKEN));
  }
};