
const config = {
    rules: {
        keysOnViews: "error",
        zombieKeys: "warning",
        emptyKeys: "warning",
        misprint: {
            "type": "warning",
            "coefficient": 0.9
        },
        ignoredKeys: [],
        ignoredMisprintKeys: []
    },
    fetch: {
        requestQuery: "",
        requestHeaders: {},
        responseQuery: "",
        get: async () => {
            const requestOne = fetch('https://raw.githubusercontent.com/romanrostislavovich/ngx-translate-lint/refs/heads/develop/test/integration/inputs/locales/EN-eu.json');
            const requestTwo = fetch('https://raw.githubusercontent.com/romanrostislavovich/ngx-translate-lint/refs/heads/develop/test/integration/inputs/locales/EN-us.json');
            const result = await Promise.all([requestOne, requestTwo]).then(async ([responseOne, responseTwo]) => {
                return {
                    ...(await responseOne.json()),
                    ...(await  responseTwo.json())
                }
            });
            return result;
        }
    },
    fixZombiesKeys: false,
    project: "./src/app/**/*.{html,ts}",
    languages: "./src/assets/i18n/*.json"
}

export default config;

