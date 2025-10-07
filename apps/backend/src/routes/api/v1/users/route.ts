import { database } from "@/database";
import { UserDatabase } from "../../../../services/database/users/index";

export const GET = async () => {
    const users = database.userService.getAllUsers();
    console.log(users);
    return Response.json(users);
}

// Create new user
export const POST = async (req: Request) => {
    try {
        const { name, username, email, password, role } = await req.json();

        if (!name || !username || !email || !password || !role) {
            return Response.json({
                error: "Missing required fields",
                message: "name, email, password and role are required"
            }, { status: 400 });
        }

        const newUser = await database.userService.createUser(
            { name, username, email, password, role });

        return Response.json(newUser, { status: 201 });
    } catch (error) {
        console.log(error);
        return Response.json(
            {
                error: "Internal server error",
                message: error
            }, { status: 500 });
    }
}
