import {broadcast} from "../ws/ws.controller";

export const onScoreUpdate = (roundId: string, userId: string, score: number): void => {
    broadcast({roundId, userId, score})
}