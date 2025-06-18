export interface IPubSub {
    publish(roundId: string, userId: string, score: number): Promise<void>
    subscribe(cb: (roundId: string, userId: string, score: number) => void): void
}
