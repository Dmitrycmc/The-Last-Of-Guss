import jwt from "jsonwebtoken";
import config from "../config";
import { User } from "../generated/prisma";

export const generateToken = (user: User): string => jwt.sign({ id: user.id, username: user.username, role: user.role }, config.jwtSecret)