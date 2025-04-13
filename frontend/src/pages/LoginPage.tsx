import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { login, setAuthToken } from "@/lib/auth"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const res = await login(username, password)
      setAuthToken(res.data.access)
      navigate("/dashboard")
    } catch (e) {
      setError("Invalid credentials")
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-full max-w-md bg-white p-6 shadow rounded space-y-4">
        <h1 className="text-xl font-semibold">Login</h1>
        <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button className="w-full" onClick={handleLogin}>Login</Button>
        <p className="text-sm">
          Don’t have an account? <Link to="/signup" className="text-blue-600 underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
