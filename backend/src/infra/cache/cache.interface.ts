export interface ICache {
    getRoundScores(roundId: string): Promise<Record<string, number>>
    setScore(roundId: string, username: string, value: number): number
    incrementScore(roundId: string, username: string): Promise<number>
    acquireLock(roundId: string): Promise<boolean>
    prolongateLock(roundId: string): Promise<void>
}
