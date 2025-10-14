import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import {
  ACCESS_TOKEN_COOKIE_CONFIG,
  REFRESH_TOKEN_COOKIE_CONFIG,
  COOKIE_NAMES,
} from "@/constants/cookies";
import { BadRequestError, UnauthorizedError } from "@/utils/error";
import {
  registerUser,
  loginUser,
  createTokenPair,
  rotateTokens,
  destroyRefreshToken,
} from "@/services/auth";




