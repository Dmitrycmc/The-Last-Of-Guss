import {useState} from 'react'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import {httpRequest} from "@/api";
import {storage} from "@/lib/storage";

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleRegister = async () => {
        if (!username || !password) return

        setError('')
        try {
            const data = await httpRequest.register(username, password)
            console.log(data)
            storage.setToken(data.token)
            window.location.assign('/rounds')
        } catch (err) {
            if (typeof err === 'object' && err !== null && 'message' in err) {
                setError("Error: " + err.message);
            } else {
                setError("Error: " + JSON.stringify(err));
            }
        }
    }

    const handleLogin = async () => {
        if (!username || !password) return

        setError('')
        try {
            const data = await httpRequest.login(username, password)
            console.log(data)
            storage.setToken(data.token)
            window.location.assign('/rounds')
        } catch (err) {
            if (typeof err === 'object' && err !== null && 'message' in err) {
                setError("Error: " + err.message);
            } else {
                setError("Error: " + JSON.stringify(err));
            }
        }
    }

    return (
        <div className="flex flex-col gap-4 w-sm mx-auto mt-20">
            <h1 className="text-2xl font-bold">Login</h1>
            <Input
                placeholder="Enter username"
                value={username}
                onChangeValue={setUsername}
            />
            <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChangeValue={setPassword}
            />
            <Button variant="outline" className="w-full" onClick={handleRegister} disabled={!username || !password}>Register</Button>
            <Button variant="outline" className="w-full" onClick={handleLogin} disabled={!username || !password}>Login</Button>
            {error && <div className="text-red-500">{error}</div>}
        </div>
    )
}