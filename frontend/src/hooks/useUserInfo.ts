import type {DecodedUserToken} from "@/types/decodedUserToken";
import {storage} from "@/lib/storage";
import {useMemo} from "react";
import {parseJwt} from "@/lib/jwt";

const useUserInfo = (): DecodedUserToken => {
    return useMemo(() => {
        const token = storage.getToken()
        if (!token) {
            throw new Error('Missing auth token')
        }
        return parseJwt(token)
    }, [])
}

export default useUserInfo