import {useState} from "react";
import type {FC} from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Card, CardContent } from "@/components/atoms/card";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {httpRequest} from "@/api";
import type {Round} from "@/types/round";

type Props = {
    onAdd: (round: Round) => void
}

const AdminCreateRoundPanel: FC<Props> = ({onAdd}) => {
    const [startAt, setStartAt] = useState<Date>(new Date(new Date().getTime() + 60000));
    const [duration, setDuration] = useState<number>(30);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const newRound = await httpRequest.createRound(startAt, duration)
            onAdd(newRound)
            setMessage("Round created successfully: " + newRound.id);
        } catch (err: any) {
            setMessage("Error: " + (err.message || JSON.stringify(err)));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div>
                        <Label>Start At (Date & Time)</Label>
                        <div className="[&>div]:w-full">
                            <DatePicker
                                selected={startAt}
                                onChange={(date: Date | null) => date && setStartAt(date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={1}
                                dateFormat="yyyy-MM-dd HH:mm"
                                className="w-full border rounded px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Duration (seconds)</Label>
                        <Input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            min={15}
                            max={60}
                        />
                    </div>
                    <Button onClick={handleSubmit} disabled={loading} className="w-full">
                        {loading ? "Creating..." : "Create Round"}
                    </Button>
                    {message && <p className="text-sm text-muted-foreground">{message}</p>}
                </CardContent>
            </Card>
        </div>
    );
}

export default AdminCreateRoundPanel