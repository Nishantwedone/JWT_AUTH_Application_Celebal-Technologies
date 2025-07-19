import { type NextRequest, NextResponse } from "next/server"
import { UserStorage } from "@/lib/user-storage"
import { AuthUtils } from "@/lib/auth-utils"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt:", { email, passwordLength: password?.length, totalUsers: UserStorage.getUserCount() })

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Find user by email
    const user = UserStorage.findUserByEmail(email)
    if (!user) {
      console.log("User not found:", email)
      console.log(
        "Available users:",
        UserStorage.getAllUsers().map((u) => ({ id: u.id, email: u.email })),
      )
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Verify password
    const isPasswordValid = await AuthUtils.verifyPassword(password, user.password)
    if (!isPasswordValid) {
      console.log("Invalid password for user:", email)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    console.log("Login successful for user:", user.email)

    // Generate JWT token
    const token = AuthUtils.createJWT(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
    )

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error: " + (error as Error).message,
      },
      { status: 500 },
    )
  }
}
