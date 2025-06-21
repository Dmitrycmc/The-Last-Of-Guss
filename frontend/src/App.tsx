import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Button} from "./components/ui/button";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">sa</h1>
        <p className="text-2xl, bg-red-500">p text</p>
      <Button>button</Button>
    </>
  )
}

export default App
