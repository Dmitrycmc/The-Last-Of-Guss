export interface ICache {
    incrementScore(roundId: string, userId: string): Promise<number>
    acquireLock(roundId: string): Promise<boolean>
    prolongateLock(roundId: string): Promise<void>
}
