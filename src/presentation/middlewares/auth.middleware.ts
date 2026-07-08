import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { AUTH_MESSAGES, JWT_MESSAGES } from "@shared/constants/index.constants";
import { ForbiddenError, UnauthorizedError } from "./error.middleware";
import { checkUserBlockStatusUseCase, tokenUseCase } from "@di/container-resolver";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // read from cookie — no more Authorization header
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    next(new UnauthorizedError(JWT_MESSAGES.NO_ACCESS_TOKEN));
    return;
  }

  try {
    const decoded = await tokenUseCase.authAccessToken(accessToken);
    req.user = decoded as JwtPayload & { id: string; role: string; email: string };

    const isActive = await checkUserBlockStatusUseCase.execute(req.user.id);
    if (!isActive) {
      next(new ForbiddenError(AUTH_MESSAGES.ACCOUNT_BLOCKED));
      return;
    }
    next();
  } catch (error: any) {
    next(new UnauthorizedError(JWT_MESSAGES.NO_ACCESS_TOKEN));
  }
};

// admin middleware same pattern
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    next(new UnauthorizedError(JWT_MESSAGES.AUTH_HEADER_MISSING));
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