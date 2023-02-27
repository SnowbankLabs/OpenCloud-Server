module.exports = {
    overrides: [
        {
            extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended-requiring-type-checking"],
            files: ["*.ts"],
            parserOptions: {
                project: "tsconfig.json",
            },
            rules: {
                "@typescript-eslint/require-await": "off",
            },
        },
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
    },
    plugins: ["@typescript-eslint"],
    extends: ["plugin:@typescript-eslint/recommended"],
    rules: {
        "@typescript-eslint/consistent-type-imports": "warn",
    },
};
