const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");
const typescriptEslintEslintPlugin = require("@typescript-eslint/eslint-plugin");
const _import = require("eslint-plugin-import");
const tsdoc = require("eslint-plugin-tsdoc");

const {
    fixupPluginRules,
} = require("@eslint/compat");

const globals = require("globals");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        parser: tsParser,

        globals: {
            ...globals.jest,
            ...globals.node,
        },
    },

    plugins: {
        "@typescript-eslint": typescriptEslintEslintPlugin,
        import: fixupPluginRules(_import),
        tsdoc,
    },

    extends: compat.extends("plugin:@typescript-eslint/recommended"),

    rules: {
        "no-console": "error",

        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
        }],

        "@typescript-eslint/no-dupe-class-members": ["error"],
        "@typescript-eslint/no-useless-constructor": ["error"],
        "@typescript-eslint/no-inferrable-types": ["off"],
        "@typescript-eslint/no-require-imports": ["off"],

        "import/extensions": ["error", "ignorePackages", {
            js: "always",
            jsx: "never",
            ts: "never",
            tsx: "never",
        }],
    },
}, globalIgnores(["**/dist/", "**/scripts/", "**/cmd/", "**/tools/", "**/*.d.ts"])]);
