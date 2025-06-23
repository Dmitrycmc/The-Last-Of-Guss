import type {DecodedUserToken} from "@/types/decodedUserToken";

export function parseJwt(token: string): DecodedUserToken {
        const base64Payload = token.split('.')[1];
        const decodedPayload = atob(base64Payload);
        return JSON.parse(decodedPayload);
}
