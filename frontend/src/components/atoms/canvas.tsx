import {type FC, useEffect, useRef} from "react";
import {cn} from "@/lib/utils";

interface FloatingText {
    x: number;
    y: number;
    text: string;
    opacity: number;
    type: "normal" | "bonus";
}

interface GooseCanvasProps {
    disabled?: boolean
    onTap?: (onBonus: () => void) => void;
}

export const GooseCanvas: FC<GooseCanvasProps> = ({ disabled, onTap }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const floatingTextsRef = useRef<FloatingText[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const gooseFontSize = Math.min(canvas.width, canvas.height) * 0.6;
        const gooseX = canvas.width / 2;
        const gooseY = canvas.height / 2;

        let animationFrameId: number;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw goose
            ctx.font = `${gooseFontSize}px serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🪿", gooseX, gooseY);

            // Update and draw floating texts
            const updatedTexts = floatingTextsRef.current
                .map((t) => {
                    const dy = t.type === "bonus" ? 0.3 : 0.5;
                    const dOpacity = t.type === "bonus" ? 0.004 : 0.006;
                    return {
                        ...t,
                        y: t.y - dy,
                        opacity: t.opacity - dOpacity,
                    };
                })
                .filter((t) => t.opacity > 0);

            floatingTextsRef.current = updatedTexts;

            for (const t of updatedTexts) {
                ctx.globalAlpha = t.opacity;
                ctx.fillStyle = t.type === "bonus" ? "#3b82f6" : "#22c55e";
                ctx.font = "32px sans-serif";
                ctx.fillText(t.text, t.x, t.y);
            }

            ctx.globalAlpha = 1;

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const onBonus = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        floatingTextsRef.current.push({ x, y, text: "+9", opacity: 1, type: "bonus" });
    };

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (disabled) return

        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        floatingTextsRef.current.push({ x, y, text: "+1", opacity: 1, type: "normal" });

        onTap?.(() => onBonus(e));
    };

    return (
        <canvas
            ref={canvasRef}
            className={cn(
                "w-full h-[500px] bg-white rounded shadow-md transition",
                disabled ? "opacity-50" : "cursor-pointer"
            )}
            onClick={handleClick}
        />
    );
}