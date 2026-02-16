import axios from "axios";

type SupportedLanguage = "PYTHON" | "JAVASCRIPT" | "JAVA" | "CPP" | "GO" | string;

export interface Judge0Result {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
  status: {
    id: number;
    description: string;
  };
  tokens: string;
}

export interface Judge0BatchResponse {
  submissions: Judge0Result[];
}

export function getJudge0LanguageId(language: SupportedLanguage): number {
  const languageMap: Record<SupportedLanguage, number> = {
    PYTHON: 71,
    JAVASCRIPT: 63,
    JAVA: 62,
    CPP: 54,
    GO: 60,
  };

  return languageMap[language];
}

export async function submitBatch(
  submissions: any[]
): Promise<Judge0Result[]> {

  const { data } = await axios.post<Judge0BatchResponse>(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    { submissions }
  );

  return data.submissions;
}

export async function poolBatchResults(
  tokens: string[]
): Promise<Judge0Result[]> {

  while (true) {
    const { data } = await axios.get<Judge0BatchResponse>(
      `${process.env.JUDGE0_API_URL}/submissions/batch`,
      {
        params: {
          tokens: tokens.join(","),
          base64_encoded: false,
        },
      }
    );

    const results = data.submissions;

    const isAllDone = results.every(
      (r) => r.status.id !== 1 && r.status.id !== 2
    );

    if (isAllDone) {
      return results;   
    }

    await sleep(1000);
  }
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
