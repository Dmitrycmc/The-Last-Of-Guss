import {useState} from "react";
import type {FC} from "react";
import { Button } from "@/components/atoms/button";
import {httpRequest} from "@/api";
import type {Round} from "@/types/round";
import {Card, CardContent} from "@/components/atoms/card";

type Props = {
    onAdd: (round: Round) => void
}

const AdminCreateRoundPanel: FC<Props> = ({onAdd}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const newRound = await httpRequest.createRound()
            onAdd(newRound)
        } catch (err) {
            if (err instanceof Error) {
                setError("Error: " + err.message);
            } else {
                setError("Error: " + JSON.stringify(err));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <Card>
                <h2 className="text-m font-semibold text-center">Admin panel</h2>
                <CardContent className="space-y-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        variant="outline"
                        className="w-full"
                    >
                        {loading ? "Creating..." : "Create Round"}
                    </Button>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </CardContent>
            </Card>
        </div>
    );
}

export default AdminCreateRoundPanel