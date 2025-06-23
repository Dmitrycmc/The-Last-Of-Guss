type WSOptions = {
    token?: string;
    reconnectDelay?: number;
    onOpen?: () => void;
    onMessage?: (msg: any) => void;
    onClose?: (v: CloseEvent) => void;
    onError?: (v: Event) => void;
};

export class ReconnectingWebSocket {
    private _url: string;
    private _ws: WebSocket | null = null;
    private _shouldReconnect = true;
    private _reconnectDelay: number;
    private _onMessage?: (msg: any) => void;
    private _onOpen?: () => void;
    private _onClose?: (e: CloseEvent) => void;
    private _onError?: (e: Event) => void;

    constructor(path: string, options: WSOptions = {}) {
        const host = import.meta.env.VITE_WS_HOST;
        const tokenPart = options.token ? `?token=${options.token}` : '';
        this._url = `${host}${path}${tokenPart}`;
        this._reconnectDelay = options.reconnectDelay ?? 500;
        this._onMessage = options.onMessage;
        this._onOpen = options.onOpen;
        this._onClose = options.onClose;
        this._onError = options.onError;

        this._connect();
    }

    private _connect() {
        this._ws = new WebSocket(this._url);

        this._ws.onopen = () => {
            this._onOpen?.();
            console.log('[WS] Connected');
        };

        this._ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                this._onMessage?.(msg);
            } catch (e) {
                console.warn('[WS] Invalid message:', event.data);
            }
        };

        this._ws.onclose = (event) => {
            this._onClose?.(event);
            console.log('[WS] Closed:', event.code, event.reason);
            if (this._shouldReconnect && event.code !== 4001 && event.code !== 1008) {
                setTimeout(() => this._connect(), this._reconnectDelay);
            }
        };

        this._ws.onerror = (event) => {
            this._onError?.(event);
            console.error('[WS] Error:', event);
        };
    }

    public send(data: unknown) {
        if (this.isConnected()) {
            this._ws?.send(typeof data === 'string' ? data : JSON.stringify(data));
        } else {
            console.log('WS is closed')
        }
    }

    public close() {
        this._shouldReconnect = false;
        this._ws?.close();
    }

    public isConnected(): boolean {
        return this._ws?.readyState === WebSocket.OPEN;
    }
}

export const errorCode = {
    ANOTHER_SESSION_STARTED_ERROR_CODE: 4001
}
