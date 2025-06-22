import { RoundStatus } from "@/types/round";

export const emojiStatus = (status: RoundStatus): string => {
    switch (status) {
        case RoundStatus.COOLDOWN_STATUS:
            return "🕓";
        case RoundStatus.ACTIVE_STATUS:
            return "⚔️";
        case RoundStatus.FINISHED_STATUS:
            return "🏆";
        default:
            return "❓";
    }
};