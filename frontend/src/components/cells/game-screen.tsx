import {emojiStatus} from "@/lib/emoji";
import {formatTimeLeft} from "@/lib/format";
import {Progress} from "@/components/atoms/progress";
import {GooseCanvas} from "@/components/atoms/canvas";
import {ScoresTable} from "@/components/cells/scores-table";
import {DeveloperPanel} from "@/components/cells/developer-panel";
import {type Dispatch, type FC, type SetStateAction, useMemo, useState} from "react";
import useRoundWebSocket from "@/hooks/useWebSocket";
import type {DecodedUserToken} from "@/types/decodedUserToken";
import {Role, type RoundInfo, RoundStatus} from "@/types/round";

type Props = {
    userInfo: DecodedUserToken
    round: RoundInfo
    setRound: Dispatch<SetStateAction<RoundInfo | null>>
    scores: Record<string, number>
    setScores: Dispatch<SetStateAction<Record<string, number>>>
}

export const GameScreen: FC<Props> = ({round, userInfo, setRound, scores, setScores}) => {
    const [cooldown, setCooldown] = useState<number | null>(null);
    const [gameTimeLeft, setGameTimeLeft] = useState<number | null>(null);
    const [leader, setLeader] = useState<string | null>(null);
    const [connected, setConnected] = useState<string | null>(null);

    const selfScores = scores[userInfo.username]

    const gameDuration = useMemo(() => round && (new Date(round.endAt).getTime() - new Date(round.startAt).getTime()), [round])
    const timeToStart = useMemo(() => round && (new Date(round.startAt).getTime() - Date.now()), [round])

    const handleMessage = (m: unknown) => {
        //console.log('Received message: ', m)
        const {type} = m as {type: string}
        if (type === "update-score") {
            const {scores} = m as {type: string, scores: Record<string, number>}
            setScores(s => {
                const merged = { ...s, ...scores };

                const optimisticSelfScores = s[userInfo.username];
                const realisticSelfScores = scores[userInfo.username];

                if (optimisticSelfScores !== undefined && realisticSelfScores !== undefined) {
                    merged[userInfo.username] = Math.max(optimisticSelfScores, realisticSelfScores);
                } else if (optimisticSelfScores !== undefined || realisticSelfScores !== undefined) {
                    merged[userInfo.username] = optimisticSelfScores ?? realisticSelfScores;
                }

                const sortedScores = Object.entries(merged).sort((a, b) => b[1] - a[1]);
                return Object.fromEntries(sortedScores);
            });
        } else if (type === "cooldown-tick") {
            const {remaining, leader, connected} = m as {type: string, remaining: number, leader: string, connected: string}
            setLeader(leader)
            setConnected(connected)
            setCooldown(remaining);
        } else if (type === "start") {
            const {leader, connected} = m as {leader: string, connected: string}
            setLeader(leader)
            setConnected(connected)
            setCooldown(null);
            setGameTimeLeft(null);
            setRound(r => r && ({...r, status: RoundStatus.ACTIVE_STATUS}))
        } else if (type === "game-tick") {
            const {remaining, leader, connected} = m as {type: string, remaining: number, leader: string, connected: string}
            setLeader(leader)
            setConnected(connected)
            setGameTimeLeft(remaining);
        } else if (type === "end") {
            const {leader, connected, scores} = m as {leader: string, connected: string, scores: Record<string, number>}
            setLeader(leader)
            setConnected(connected)
            setGameTimeLeft(null);
            setRound(r => r && ({...r, status: RoundStatus.FINISHED_STATUS}))
            const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
            setScores(Object.fromEntries(sortedScores))
        }
    };

    const [sendToWs, isConnected] = useRoundWebSocket(round.id, {onMessage: handleMessage})

    const handleTap = async (onBonus: () => void) => {
        const bonusTap = (selfScores + 10) % 20 === 0

        if (bonusTap) {
            onBonus()
        }
        if (userInfo.role !== Role.NIKITA_ROLE) {
            setScores(s => ({
                ...s,
                [userInfo.username]: (s[userInfo.username] || 0) + (bonusTap ? 10 : 1)
            }))
        }
        try {
            sendToWs("tap");
        } catch (e) {
            console.error("Failed to tap", e);
        }
    };


    if (!isConnected) return <div className="p-4">Connecting...</div>;
    if (!round) return <div className="p-4 text-red-500">Round not found</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-2">
                Round {round.id.slice(0, 6)}
            </h1>
            <div className="mb-4">
                <span className="font-medium">Status:</span>{" "}
                <span className="capitalize">
                {emojiStatus(round.status)}
            </span>
            </div>

            {timeToStart && (
                <div className="mb-4">
                    {cooldown !== null && (
                        <div className="text-yellow-600 font-semibold mb-1">
                            Game starts in:
                            {formatTimeLeft(cooldown).map((part, idx) => (
                                <p key={idx}>{part}</p>
                            ))}
                        </div>
                    )}
                    <Progress value={cooldown === null ? 0 : ((timeToStart - cooldown * 1000) / timeToStart) * 100} className="bg-yellow-100 [&>div]:bg-yellow-500"/>
                </div>
            )}

            {gameTimeLeft !== null && gameDuration !== null && (
                <div className="mb-4">
                    <div className="text-green-700 font-semibold mb-1">
                        Game ends in:
                        {formatTimeLeft(gameTimeLeft).map((part, idx) => (
                            <p key={idx}>{part}</p>
                        ))}
                    </div>
                    <Progress value={((gameDuration - gameTimeLeft * 1000) / gameDuration) * 100} className="bg-green-100 [&>div]:bg-green-500" />
                </div>
            )}

            <GooseCanvas disabled={round.status !== RoundStatus.ACTIVE_STATUS} onTap={handleTap} zeroMode={userInfo.role === Role.NIKITA_ROLE} />

            <ScoresTable username={userInfo.username} scores={scores} />
            <DeveloperPanel data={{leader, connected}} />
        </div>
    );
}