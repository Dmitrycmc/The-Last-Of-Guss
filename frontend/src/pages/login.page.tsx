import {useRef, useState} from 'react'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import {httpRequest} from "@/api";
import {storage} from "@/lib/storage";

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const passwordFieldRef = useRef<HTMLInputElement | null>(null)

    const handleSubmit = async () => {
        if (!username || !password) return

        setError('')
        try {
            const data = await httpRequest.loginOrRegister(username, password)
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
                onEnter={() => {
                    passwordFieldRef.current?.focus()
                }}
            />
            <Input
                ref={passwordFieldRef}
                type="password"
                placeholder="Enter password"
                value={password}
                onChangeValue={setPassword}
                onEnter={handleSubmit}
            />
            {error && <div className="text-red-500">{error}</div>}
            <Button variant="outline" className="w-full" onClick={handleSubmit} disabled={!username || !password}>Login</Button>
        </div>
    )
}