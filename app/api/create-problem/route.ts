import { getJudge0LanguageId } from "@/lib/judge0";
import { currentUserRole } from "@/modules/auth";
import { currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const userRole = await currentUserRole();
        const user = await currentUser();

        if (userRole !== UserRole.ADMIN) {
            return NextResponse.json({ error: "Unauthorised" })
        }

        const body = await request.json();

        const { title, description, difficulty, tags, examples, constraints, testCases, codeSnippets, referenceSolutions } = body;

        if (!title || !description || !difficulty || !tags || !examples || !constraints || !testCases || !codeSnippets || !referenceSolutions) {
            return NextResponse.json({ error: "Missing Required Fields" })
        }

        if (!Array.isArray(testCases) || testCases.length === 0) {
            return NextResponse.json({ error: "At least one test case is required" })
        }

        if (!referenceSolutions || typeof referenceSolutions !== 'object') {
            return NextResponse.json({ error: "Reference solutions must be provided for all supported languages" })
        }

        for (const [languages, solutionCode] of Object.entries(referenceSolutions)) {
            const languageId = getJudge0LanguageId(languages);
            if (!languageId) {
                return NextResponse.json({ error: "UNSUPPORTED LANGUAGES" })
            }

            const submissions = testCases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }));
        }
    } catch (error) {

    }
}