import {useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import {httpRequest} from "@/api";
import type {Round} from "@/types/round";
import {RoundStatus} from "@/types/round";
import {emojiStatus} from "@/lib/emoji";
import {formatTimeLeft} from "@/lib/format";
import {Progress} from "@/components/atoms/progress";
import useUserInfo from "@/hooks/useUserInfo";
import useRoundWebSocket from "@/hooks/useWebSocket";
import {GooseCanvas} from "@/components/atoms/canvas";
import {DeveloperPanel} from "@/components/cells/developer-panel";

export default function RoundPage() {
    const roundId = useParams().roundId as string;
    const [round, setRound] = useState<Round | null>(null);
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [cooldown, setCooldown] = useState<number | null>(null);
    const [gameTimeLeft, setGameTimeLeft] = useState<number | null>(null);
    const [leader, setLeader] = useState<string | null>(null);
    const [connected, setConnected] = useState<string | null>(null);

    const userInfo = useUserInfo()

    const selfScores = scores[userInfo.username]

    const gameDuration = useMemo(() => round && (new Date(round.endAt).getTime() - new Date(round.startAt).getTime()), [round])
    const timeToStart = useMemo(() => round && (new Date(round.startAt).getTime() - Date.now()), [round])

    useEffect(() => {
        httpRequest
            .getRoundInfo(roundId)
            .then(setRound)
            .catch(() => console.error("Failed to load round info"))
            .finally(() => setLoading(false));
    }, [roundId]);

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

                const sortedEntries = Object.entries(merged).sort((a, b) => b[1] - a[1]);
                return Object.fromEntries(sortedEntries);
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
            setScores(scores)
        }
    };

    const [sendToWs, isConnected] = useRoundWebSocket(roundId, {onMessage: handleMessage})

    const handleTap = async (onBonus: () => void) => {
        const bonusTap = (selfScores + 10) % 20 === 0

        if (bonusTap) {
            onBonus()
        }
        setScores(s => ({
            ...s,
            [userInfo.username]: (s[userInfo.username] || 0) + (bonusTap ? 10 : 1)
        }))
        try {
            sendToWs("tap");
        } catch (e) {
            console.error("Failed to tap", e);
        }
    };

    if (loading || !userInfo) return <div className="p-4">Loading...</div>;
    if (!isConnected && round?.status !== RoundStatus.FINISHED_STATUS) return <div className="p-4 text-red-500">Disconnected...</div>;
    if (!round) return <div className="p-4 text-red-500">Round not found</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-2">
                Round {roundId.slice(0, 6)}
            </h1>
            <div className="mb-4">
                <span className="font-medium">Status:</span>{" "}
                <span className="capitalize">
                {emojiStatus(round.status)}
            </span>
            </div>

            {cooldown !== null && timeToStart && (
                <div className="mb-4">
                    <div className="text-yellow-600 font-semibold mb-1">
                        Game starts in:
                        {formatTimeLeft(cooldown).map((part, idx) => (
                            <p key={idx}>{part}</p>
                        ))}
                    </div>
                    <Progress value={((timeToStart - cooldown * 1000) / timeToStart) * 100} className="bg-yellow-100 [&>div]:bg-yellow-500"/>
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

            <GooseCanvas disabled={round.status !== RoundStatus.ACTIVE_STATUS} onTap={handleTap} />

            <table className="mt-4 text-sm text-left border border-gray-200 w-full">
                <thead className="bg-gray-100 text-gray-700">
                <tr>
                    <th className="px-4 py-2 border-b">Player</th>
                    <th className="px-4 py-2 border-b">Score</th>
                </tr>
                </thead>
                <tbody>
                {Object.entries(scores).map(([userId, score], index) => userId === userInfo!.username ? (
                    <tr
                        key={userId}
                        className="border-t bg-green-100 font-semibold"
                    >
                        <td className="px-4 py-2">
                            {index === 0 && <span className="mr-1">🏆</span>}
                            {userId}
                        </td>
                        <td className="px-4 py-2 text-right">{selfScores}</td>
                    </tr>
                ) : (
                    <tr
                        key={userId}
                        className="border-t"
                    >
                        <td className="px-4 py-2">
                            {index === 0 && <span className="mr-1">🏆</span>}
                            {userId}
                        </td>
                        <td className="px-4 py-2 text-right">{score}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <DeveloperPanel data={{leader, connected}} />
        </div>
    );
}