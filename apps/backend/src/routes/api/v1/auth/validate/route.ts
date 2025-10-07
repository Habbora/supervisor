import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { database } from "@/database";

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

interface CustomJwtPayload extends JwtPayload {
    id: number;
}

export const POST = async (req: Request) => {
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        return Response.json({ error: "Token is required" }, { status: 400 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;

    if (!decoded.id) {
        return Response.json({ error: "Invalid token" }, { status: 400 });
    }

    const userService = database.userService;
    const user = userService.getUserById(decoded.id);
    const userWithoutPassword = {
        ...user,
        password: undefined
    };

    return Response.json({ user: userWithoutPassword }, { status: 200 });
}