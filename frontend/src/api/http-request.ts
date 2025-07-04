import {storage} from "@/lib/storage";
import type {Round, RoundInfo} from "@/types/round";

class HttpRequest {
    constructor(private _prefix: string, private _token: string | null) {}

    private async get(path: string, {payload, withToken}: {payload?: Record<string, string>, withToken?: boolean}  = {}) {
        const fullPath = payload ? `${this._prefix}${path}?${new URLSearchParams(payload)}` : `${this._prefix}${path}`
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        }
        if (withToken) {
            if (this._token === null) {
                throw new Error('Token is not provided')
            }
            headers['Authorization'] = `Bearer ${this._token}`
        }
        const res = await fetch(fullPath, {headers})
        const data = await res.json()
        if (!res.ok) throw data
        return data
    }

    private async post(path: string, {payload, withToken}: {payload?: Record<string, string>, withToken?: boolean}  = {}) {
        const fullPath = `${this._prefix}${path}`
        const headers: Record<string, string> = {}
        if (payload) {
            headers['Content-Type'] = 'application/json'
        }
        if (withToken) {
            if (this._token === null) {
                throw new Error('Token is not provided')
            }
            headers['Authorization'] = `Bearer ${this._token}`
        }
        const res = await fetch(fullPath, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) throw data
        return data
    }

    register(username: string, password: string) {
        return this.post('/register', {payload: {username, password}})
    }

    login(username: string, password: string) {
        return this.post('/login', {payload: {username, password}})
    }

    getRoundsList(): Promise<Round[]> {
        return this.get('/rounds', {withToken: true})
    }

    getRoundInfo(id: string): Promise<RoundInfo> {
        return this.get(`/rounds/${id}`, {withToken: true})
    }

    async createRound(): Promise<Round> {
        return await this.post(`/rounds`, {
            withToken: true
        })
    }
}

const httpRequest = new HttpRequest('/api', storage.getToken())

export default httpRequest