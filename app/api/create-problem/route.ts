import { db } from "@/lib/db";
import { getJudge0LanguageId, poolBatchResults, submitBatch } from "@/lib/judge0";
import { currentUserRole, getCurrentUser } from "@/modules/auth";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const userRole = await currentUserRole();
        const user = await getCurrentUser();

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

            const submissionResults = await submitBatch(submissions);
            const tokens = submissionResults.map((res) => res.tokens);
            const results = await poolBatchResults(tokens);

            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (result.status.id !== 3) {
                    return NextResponse.json({
                        error: `Validation failed for language ${languages}`,
                        testCase: {
                            input: submissions[i].stdin,
                            expectedOuput: submissions[i].expected_output,
                            actualOutput: result.stdout,
                            error: result.stderr || result.compile_output
                        },
                        details: result,
                    },
                    );
                }
            }
        }

        const newProblem = await db.problem.create({
            data: {
                title,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                testCases,
                codeSnippets,
                referenceSolutions,
                user: {
                    connect: {
                        id: user!.id,
                    },
                },
            },
        });
        if (!user) {
            return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
        }


        return NextResponse.json({ success: true, message: "Problem created successfully", data: newProblem })

    } catch (error) {
        console.log("Database error", error);
        return NextResponse.json({ error: "Failed to save problem to database" })
    }
}