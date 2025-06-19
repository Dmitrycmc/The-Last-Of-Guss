export interface IPubSub {
    publish(roundId: string, userId: string, score: number): Promise<void>
    subscribe(roundId: string, cb: (userId: string, score: number) => void): void
    unsubscribe(roundId: string, cb: (userId: string, score: number) => void): void
}
