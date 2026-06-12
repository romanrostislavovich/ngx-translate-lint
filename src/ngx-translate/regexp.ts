const keysFromDirectiveInsideTag: string = `(?<=<[^>]*\\b(?:translate|TRANSLATE)\\b(?!\\}|\\s*\\"|:|\\))[^>]*>\\s*)([a-zA-Z0-9_\\-.]*)(?=\\s*<\\s*\\/[^>]*>)`;
const keysFromDirectiveInView: string = `(?<=(?:translate|\\[translate\\])=["']{1,2})([a-zA-Z0-9_\\-.]*)(?=["']{1,2})`;
const keysFromPipeInView: string = `(?<=['"])([a-zA-Z0-9_\\-.]*)(?=['"](?:\\s*\\|\\s*\\w+)*\\s*\\|\\s*translate)`;

export const ngxTranslateRegEx: string[] = [
    keysFromDirectiveInsideTag,
    keysFromDirectiveInView,
    keysFromPipeInView,
];
