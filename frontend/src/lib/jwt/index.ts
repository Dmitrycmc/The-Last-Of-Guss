import type {DecodedUserToken} from "@/types/decodedUserToken";

export function parseJwt(token: string): DecodedUserToken | null {
    try {
        const base64Payload = token.split('.')[1];
        const decodedPayload = atob(base64Payload);
        return JSON.parse(decodedPayload);
    } catch {
        return null;
    }
}
