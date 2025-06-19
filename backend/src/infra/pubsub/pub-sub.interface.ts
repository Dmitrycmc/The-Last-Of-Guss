export interface IPubSub {
    publish(roundId: string, message: unknown): Promise<void>
    subscribe(roundId: string, cb: (message: unknown) => void): void
    unsubscribe(roundId: string, cb: (message: unknown) => void): void
}
