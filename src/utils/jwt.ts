import jwt from "jsonwebtoken";
import {User, WithId} from "../modules/auth/types";
import config from "../config";

export const generateToken = (user: WithId<User>): string => jwt.sign({ id: user.id, username: user.username, role: user.role }, config.jwtSecret)