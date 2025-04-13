import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signup } from "@/lib/auth"

export default function SignupPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSignup = async () => {
    try {
      await signup(username, password)
      navigate("/login")
    } catch (e) {
      setError("Signup failed. Username may already exist.")
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-full max-w-md bg-white p-6 shadow rounded space-y-4">
        <h1 className="text-xl font-semibold">Sign Up</h1>
        <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button className="w-full" onClick={handleSignup}>Sign Up</Button>
        <p className="text-sm">
          Already have an account? <Link to="/login" className="text-blue-600 underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
