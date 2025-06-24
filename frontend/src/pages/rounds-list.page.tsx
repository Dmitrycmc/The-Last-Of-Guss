import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,} from "@/components/atoms/table"
import {useEffect, useState} from "react";
import {httpRequest} from "@/api";
import {emojiStatus} from "@/lib/emoji";
import {useNavigate} from "react-router-dom";
import type {Round} from "@/types/round";
import {Role} from "@/types/round";
import useUserInfo from "@/hooks/useUserInfo";
import AdminCreateRoundPanel from "@/components/cells/create-round-panel";

export default function RoundsListPage() {
    const [rounds, setRounds] = useState<Round[]>([])
    const [loading, setLoading] = useState(true)
    const userInfo = useUserInfo()

    useEffect(() => {
        httpRequest.getRoundsList()
            .then(setRounds)
            .catch(() => console.error("Failed to load rounds"))
            .finally(() => setLoading(false))
    }, [])

    const navigate = useNavigate()

    const onRoundClick = (roundId: string) => {
        navigate(`/rounds/${roundId}`)
    }

    const onRoundCreate = (round: Round): void => {
        navigate(`/rounds/${round.id}`)
    }

    if (loading) return <div className="p-4">Loading...</div>

    return (
        <div>
            {userInfo?.role === Role.ADMIN_ROLE && (
                <AdminCreateRoundPanel onAdd={onRoundCreate} />
            )}
            <Table>
                <TableCaption>All rounds available in the game</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>CreatedAt</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rounds.map((r) => (
                        <TableRow key={r.id} className="cursor-pointer" onClick={() => onRoundClick(r.id)}>
                            <TableCell>{r.id.slice(0, 6)}</TableCell>
                            <TableCell className="capitalize">{emojiStatus(r.status)}</TableCell>
                            <TableCell>
                                {new Date(r.startAt).toLocaleString()}
                            </TableCell>
                            <TableCell>{(new Date(r.endAt).getTime() - new Date(r.startAt).getTime()) / 1000}s</TableCell>
                            <TableCell>{r.createdAt}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}