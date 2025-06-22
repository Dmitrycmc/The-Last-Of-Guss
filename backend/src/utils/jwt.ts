import jwt from "jsonwebtoken";
import config from "../config";
import { User } from "../generated/prisma";
import {UserTokenData} from "../types/user-token-data";

export const generateToken = (user: User): string => jwt.sign({ username: user.username, role: user.role }, config.jwtSecret)

export const parseToken = (token: string): UserTokenData => jwt.verify(token, config.jwtSecret) as UserTokenData