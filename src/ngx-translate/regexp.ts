const keysFromDirectiveInsideTag: string = `(?<=<[^<]*[\\s*\\w*\\s*]*(translate|TRANSLATE)(?!\\}|\\s{0,}\\"|:|\\))[\\s*\\w*\\s*]*[^>]*>\\s*)([a-zA-Z0-9_\\-.]*)(?=\\s*<\\s*\\/.*\\s*>)`;
const keysFromDirectiveInView: string = `(?<=translate=["']{1,2}|\\[translate\\]=["']{1,2})([A-Za-z0-9_\\-.]+)(?=["']{1,2})`;
const keysFromPipeInView: string = `(?<=['"])([a-zA-Z0-9_\\-.]*)(?=['"]\\s?\\|\\s?translate|['"](\\s*\\|\\s*\\w*)*translate)`;

export const ngxTranslateRegEx: string[] = [
    keysFromDirectiveInsideTag,
    keysFromDirectiveInView,
    keysFromPipeInView,
];
