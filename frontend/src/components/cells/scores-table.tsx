import { type FC } from "react";

type Props = {
    scores: Record<string, number>;
    username: string;
};

export const ScoresTable: FC<Props> = ({ scores, username: selfUsername }) => {
    return (
        <table className="w-full border border-gray-200 text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
            <tr>
                <th className="px-4 py-2 border-b">Player</th>
                <th className="px-4 py-2 border-b text-right">Score</th>
            </tr>
            </thead>
            <tbody>
            {Object.entries(scores).map(([username, score], index) => (
                <tr
                    key={username}
                    className={
                        username === selfUsername
                            ? "border-t bg-green-100 font-semibold"
                            : "border-t"
                    }
                >
                    <td className="px-4 py-2">
                        {index === 0 && <span className="mr-1">🏆</span>}
                        {username}
                    </td>
                    <td className="px-4 py-2 text-right">{score}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};