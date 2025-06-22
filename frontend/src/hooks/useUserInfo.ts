import type {DecodedUserToken} from "@/types/decodedUserToken";
import {storage} from "@/lib/storage";
import {useMemo} from "react";
import {parseJwt} from "@/lib/jwt";

const useUserInfo = (): DecodedUserToken | null => {
    return useMemo(() => {
        const token = storage.getToken()
        return token && parseJwt(token) || null
    }, [])
}

export default useUserInfo