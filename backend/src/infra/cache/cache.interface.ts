export interface ICache {
    getRoundScores(roundId: string): Promise<Record<string, number>>
    incrementScore(roundId: string, username: string): Promise<number>
    acquireLock(roundId: string): Promise<boolean>
    prolongateLock(roundId: string): Promise<void>
}
