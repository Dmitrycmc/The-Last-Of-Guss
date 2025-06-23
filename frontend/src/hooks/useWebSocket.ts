import { useEffect, useRef, useState, useCallback } from "react";
import {storage} from "@/lib/storage";
import {ReconnectingWebSocket} from "@/api";

type WSOptions = {
    token?: string;
    reconnectDelay?: number;
    onOpen?: () => void;
    onMessage?: (msg: any) => void;
    onClose?: (ev: CloseEvent) => void;
    onError?: (ev: Event) => void;
};

function useWebSocket(
    path: string,
    options: WSOptions = {}
): [(data: unknown) => void, boolean] {
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<ReconnectingWebSocket | null>(null);

    const send = useCallback((data: unknown) => {
        wsRef.current?.send(data);
    }, []);

    useEffect(() => {
        const ws = new ReconnectingWebSocket(path, {
            ...options,
            onOpen: () => {
                setIsConnected(true);
                options.onOpen?.();
            },
            onClose: (ev) => {
                setIsConnected(false);
                options.onClose?.(ev);
            },
            onMessage: options.onMessage,
            onError: options.onError,
            reconnectDelay: options.reconnectDelay,
            token: options.token,
        });

        wsRef.current = ws;

        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [path, options.token, options.reconnectDelay]);

    return [send, isConnected];
}

function useRoundWebSocket(
    roundId: string,
    options: WSOptions = {}
): [(data: unknown) => void, boolean] {
    const token = storage.getToken()
    if (token === null) {
        throw new Error('Token is not provided')
    }
    return useWebSocket(`/rounds/${roundId}`, {...options,  token})
}

export default useRoundWebSocket