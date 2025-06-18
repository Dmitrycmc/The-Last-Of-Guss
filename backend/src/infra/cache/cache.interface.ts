export interface ICache {
    incrementScore(roundId: string, userId: string): Promise<number>
}
