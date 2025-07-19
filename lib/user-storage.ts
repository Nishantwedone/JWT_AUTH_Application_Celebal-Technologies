import fs from "fs"
import path from "path"
// Shared user storage that persists across API routes
interface User {
  id: string
  email: string
  name: string
  password: string
}

// Path to the users JSON file
const USERS_FILE = path.join(process.cwd(), "users.json")

function readUsersFromFile(): User[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      // If file doesn't exist, initialize with demo user
      const demoUsers: User[] = [
        {
          id: "1",
          email: "demo@example.com",
          name: "Demo User",
          password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // demo123
        },
      ]
      fs.writeFileSync(USERS_FILE, JSON.stringify(demoUsers, null, 2))
      return demoUsers
    }
    const data = fs.readFileSync(USERS_FILE, "utf-8")
    return JSON.parse(data)
  } catch (err) {
    console.error("Error reading users file:", err)
    return []
  }
}

function writeUsersToFile(users: User[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
  } catch (err) {
    console.error("Error writing users file:", err)
  }
}

export class UserStorage {
  static getAllUsers(): User[] {
    return readUsersFromFile()
  }

  static findUserByEmail(email: string): User | undefined {
    return readUsersFromFile().find((user) => user.email === email)
  }

  static findUserById(id: string): User | undefined {
    return readUsersFromFile().find((user) => user.id === id)
  }

  static addUser(user: User): void {
    const users = readUsersFromFile()
    users.push(user)
    writeUsersToFile(users)
    console.log("User added to storage:", { id: user.id, email: user.email, totalUsers: users.length })
  }

  static getUserCount(): number {
    return readUsersFromFile().length
  }

  static userExists(email: string): boolean {
    return readUsersFromFile().some((user) => user.email === email)
  }
}

export type { User }
