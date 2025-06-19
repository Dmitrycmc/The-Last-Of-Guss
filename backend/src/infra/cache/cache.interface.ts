export interface ICache {
    incrementScore(roundId: string, userId: string): Promise<number>
    acquireLock(roundId: string, ttl?: number): Promise<boolean>
    releaseLock(roundId: string): Promise<boolean>
}
