type SupportedLanguage = "PYTHON" | "JAVASCRIPT" | "JAVA" | "CPP" | "GO" | string;

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
