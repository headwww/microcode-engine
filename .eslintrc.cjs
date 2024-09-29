module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
    extends: [
		'plugin:vue/vue3-strongly-recommended',
		'airbnb-base',
		'prettier'
	],
    parser: 'vue-eslint-parser',
    parserOptions: {
		ecmaVersion: 'latest',
		parser: '@typescript-eslint/parser',
		sourceType: 'module',
		ecmaFeatures: {
			tsx: true,
			jsx: true,
		},
	},
    globals: {
		defineProps: 'readonly',
		defineEmits: 'readonly',
		defineExpose: 'readonly',
		defineModel: 'readonly',
		withDefault: 'readonly',
	},
    plugins: [
		'vue',
		'@typescript-eslint'
	],
    settings: {
        'import/resolver': {
            alias: {
                map: [
                    ['@', './src'],
                    ['#', './types']
                ],
            },
        },
        'import/extensions': ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
    },
    rules: {
		'import/no-extraneous-dependencies': 0,
		'no-param-reassing': 0,
		'vue/multi-word-commponent-names': 0,
		'vue/attribute-hyphenation': 0,
		'vue/v-on-event-hyphenation': 0,
		'import/no-unresolved': 0,
		'import/extensions': 0,
		"no-use-before-define":0,
		"no-lonely-if":0,
		"import/prefer-default-export":0,
		"import/export":0,
		"no-unused-expressions":0,
		"array-callback-return" :0,
		'no-param-reassign': 0,
		"@typescript-eslint/no-unused-vars":[2],
		"no-shadow": 0,
        "class-methods-use-this":0,
		"import/named":0,
		"no-redeclare":0,
		"no-continue":0,
		"no-plusplus":0,
		"no-undef":0,
		"vue/multi-word-component-names":0,
		"no-underscore-dangle":0,
		"no-restricted-syntax":0,
		"consistent-return":0,
		'camelcase': 0,
		"no-bitwise":0,
		"default-param-last":0,
		"vue/no-template-shadow":0,
		"import/no-self-import":0,
		"vue/require-default-prop":0,
		"vue/one-component-per-file":0,
		"no-nested-ternary":0,
		"default-case":0,
		'no-case-declarations':0,
		"vue/no-deprecated-v-on-native-modifier":0,
		"no-prototype-builtins":0,
	},
}