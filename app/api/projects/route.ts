import { projectManager } from "@/lib/workspace/project-manager";

export async function GET() {
    try {
        const projects = await projectManager.list();
        console.log(projects)

        return Response.json({
            success: true,
            projects,
        });
    } catch (error) {
        return Response.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to list projects",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { name } = await request.json();

        const project = await projectManager.create(name);

        return Response.json({
            success: true,
            project,
        });
    } catch (error) {
        return Response.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create project",
            },
            { status: 400 }
        );
    }
}