export interface IStorage {
    setToken(token: string): void
    getToken(): string | null
    deleteToken(): void
}