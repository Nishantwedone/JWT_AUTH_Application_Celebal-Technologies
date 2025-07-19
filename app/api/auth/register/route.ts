import { type NextRequest, NextResponse } from "next/server"
import { UserStorage, type User } from "@/lib/user-storage"
import { AuthUtils } from "@/lib/auth-utils"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    console.log("Registration attempt:", { name, email, passwordLength: password?.length })

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    if (UserStorage.userExists(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists with this email",
        },
        { status: 409 },
      )
    }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(password)

    // Create new user
    const newUser: User = {
      id: (UserStorage.getUserCount() + 1).toString(),
      email,
      name,
      password: hashedPassword,
    }

    UserStorage.addUser(newUser)
    console.log("User created successfully:", {
      id: newUser.id,
      email: newUser.email,
      totalUsers: UserStorage.getUserCount(),
    })

    // Generate JWT token
    const token = AuthUtils.createJWT(
      {
        userId: newUser.id,
        email: newUser.email,
      },
      JWT_SECRET,
    )

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error: " + (error as Error).message,
      },
      { status: 500 },
    )
  }
}
