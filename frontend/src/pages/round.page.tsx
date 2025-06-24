import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {httpRequest} from "@/api";
import type {RoundInfo} from "@/types/round";
import {RoundStatus} from "@/types/round";
import useUserInfo from "@/hooks/useUserInfo";
import {ScoresTable} from "@/components/cells/scores-table";
import {GameScreen} from "@/components/cells/game-screen";

export default function RoundPage() {
    const roundId = useParams().roundId as string;
    const [round, setRound] = useState<RoundInfo | null>(null);
    const [scores, setScores] = useState<Record<string, number>>({});

    const userInfo = useUserInfo()

    useEffect(() => {
        httpRequest
            .getRoundInfo(roundId)
            .then(r => {
                setRound(r)
                setScores(r.scores)
            })
            .catch(() => console.error("Failed to load round info"))
    }, [roundId]);


    if (!round || !userInfo) return <div className="p-4">Loading...</div>;

    if (round.status === RoundStatus.FINISHED_STATUS) {
        return <ScoresTable username={userInfo.username} scores={scores} />
    }

    return <GameScreen userInfo={userInfo} round={round} setRound={setRound} scores={scores} setScores={setScores}/>
}
