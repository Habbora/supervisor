export const GET = async (req: any) => {
    return new Response(JSON.stringify({ message: "Hello World" }), { status: 200 });
};

export const POST = async (req: any) => {
    return new Response(JSON.stringify({ message: "Hello World" }), { status: 200 });
};