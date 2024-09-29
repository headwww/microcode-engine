module.exports = {
	extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
	overrides: [
		// 若项目中存在scss文件，添加以下配置
		{
			files: ['*.scss', '**/*.scss'],
			customSyntax: 'postcss-scss',
			extends: ['stylelint-config-recommended-scss'],
			rules: {
				// 添加或更新你的 SCSS 规则
				'scss/no-global-function-names': null,
				'no-duplicate-selectors':null,
				"number-max-precision":null
			},
		},
	],
	rules: {
		'selector-not-notation': null,
		'selector-class-pattern':null,
		'no-descending-specificity':null,
	},
};
