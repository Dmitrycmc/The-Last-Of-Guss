import type {IStorage} from "./storage.interface";

const TOKEN_LS_KEY = 'token'

class LocalStorage implements IStorage {
    setToken(token: string): void {
        localStorage.setItem(TOKEN_LS_KEY, token)
    }

    getToken(): string | null {
        return localStorage.getItem(TOKEN_LS_KEY)
    }

    deleteToken(): void {
        return localStorage.removeItem(TOKEN_LS_KEY)
    }
}

export const storage: IStorage = new LocalStorage()