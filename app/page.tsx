"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { LogOut, Shield, Lock } from "lucide-react"

interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: any
}

export default function AuthApp() {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const [protectedData, setProtectedData] = useState<any>(null)

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(""), 5000)
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const userData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      const data: AuthResponse = await response.json()

      if (data.success && data.token && data.user) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        setUser(data.user)
        showMessage("Registration successful!", "success")
      } else {
        showMessage(data.message, "error")
      }
    } catch (error) {
      showMessage("Registration failed. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const loginData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      })

      const data: AuthResponse = await response.json()

      if (data.success && data.token && data.user) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        setUser(data.user)
        showMessage("Login successful!", "success")
      } else {
        showMessage(data.message, "error")
      }
    } catch (error) {
      showMessage("Login failed. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setProtectedData(null)
    showMessage("Logged out successfully!", "success")
  }

  const fetchProtectedData = async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      showMessage("Please login first", "error")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/protected/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setProtectedData(data)
        showMessage("Protected data fetched successfully!", "success")
      } else {
        showMessage(data.message || "Failed to fetch protected data", "error")
      }
    } catch (error) {
      showMessage("Error fetching protected data", "error")
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-green-600" />
                <CardTitle className="text-2xl">Dashboard</CardTitle>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>{user.name}</span>
                </Badge>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Message Alert */}
          {message && (
            <Alert className={messageType === "error" ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}>
              <AlertDescription className={messageType === "error" ? "text-red-700" : "text-green-700"}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {user.name}!</CardTitle>
              <CardDescription>You are successfully authenticated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>User ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Protected Route Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Protected Route Demo</span>
              </CardTitle>
              <CardDescription>Test the protected API endpoint that requires JWT authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchProtectedData} disabled={loading} className="w-full sm:w-auto">
                {loading ? "Loading..." : "Fetch Protected Data"}
              </Button>

              {protectedData && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Protected Data Response:</h4>
                  <pre className="text-sm overflow-x-auto">{JSON.stringify(protectedData, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold">JWT Authentication</h1>
          <p className="text-gray-600">Secure API with JSON Web Tokens</p>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert className={messageType === "error" ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}>
            <AlertDescription className={messageType === "error" ? "text-red-700" : "text-green-700"}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Auth Forms */}
        <Card>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" name="email" type="email" placeholder="john@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" name="password" type="password" placeholder="••••••••" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>Create a new account to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input id="register-name" name="name" type="text" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input id="register-email" name="email" type="email" placeholder="john@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Demo Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>Demo Credentials:</strong>
              </p>
              <p>Email: demo@example.com</p>
              <p>Password: demo123</p>
              <p className="text-xs text-blue-600 mt-2">Or create a new account to test the registration flow</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
