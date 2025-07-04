import { type FC, useMemo } from "react";

interface Props {
    data: Record<string, string | null>
}

const COLORS = [
    "bg-green-100 text-green-800",
    "bg-blue-100 text-blue-800",
    "bg-yellow-100 text-yellow-800",
    "bg-purple-100 text-purple-800",
    "bg-pink-100 text-pink-800",
    "bg-orange-100 text-orange-800",
];

export const DeveloperPanel: FC<Props> = ({ data }) => {
    const valueColorMap = useMemo(() => {
        const map = new Map<string, string>();
        let colorIndex = 0;

        Object.values(data).forEach((value) => {
            if (value === null) return;
            if (!map.has(value)) {
                map.set(value, COLORS[colorIndex % COLORS.length]);
                colorIndex++;
            }
        });

        return map;
    }, [data]);

    const handleKill = async (host: string) => {
        // todo: refactor
        const confirmed = window.confirm(`Kill ${host}?`);
        if (!confirmed) return;

        const maxAttempts = 8;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const res = await fetch(`/api/debug/kill/${host}`, { method: "POST" });

                if (res.ok) {
                    console.log(`Kill request to ${host} succeeded on attempt ${attempt}`);
                    return;
                } else {
                    console.warn(`Attempt ${attempt} failed: ${res.status}`);
                }
            } catch (err) {
                console.error(`Attempt ${attempt} failed`, err);
            }

            // небольшая задержка между попытками (например, 150ms)
            await new Promise((r) => setTimeout(r, 150));
        }

        console.error(`Failed to kill host ${host} after ${maxAttempts} attempts`);
    };

    return (
        <div className="fixed top-19 right-4 z-50 bg-white/90 backdrop-blur border border-gray-300 rounded-lg shadow-md text-xs p-3 space-y-1 max-w-sm">
            <div className="font-semibold text-gray-700">Network</div>
            {Object.entries(data).map(([key, value]) => {
                const colorClass = value ? valueColorMap.get(value) : "text-gray-400";

                const display =
                    value && value.length > 20
                        ? "…" + value.slice(-6)
                        : value ?? "—";

                return (
                    <div key={key} className="flex justify-between gap-2">
                        <span className="text-gray-500">{key}:</span>
                        <span
                            className={`font-mono text-right break-all px-1 rounded ${colorClass} ${value ? "cursor-pointer hover:underline" : ""}`}
                            title={value ?? ""}
                            onClick={() => value && handleKill(value)}
                        >
                            {display}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};