import MonacoEditor from '@arvin-shu/microcode-plugin-base-monaco-editor';
import { computed, defineComponent, PropType } from 'vue';
import { StyleData } from '../../types';
import { toCSS, toJSON } from './cssjson';

export default defineComponent({
	name: 'CSSCode',
	props: {
		styleData: {
			type: Object as PropType<StyleData | any>,
			default: () => ({}),
		},
		onStyleChange: {
			type: Function as PropType<(style: StyleData[]) => void>,
			default: () => {},
		},
	},

	setup(props) {
		const cssCode = computed({
			get() {
				return parseToCssCode(props.styleData);
			},
			set(value: string) {
				const styleData = parseToStyleData(value);
				props.onStyleChange(styleData);
			},
		});

		return () => (
			<div style={{ width: '350px' }}>
				<MonacoEditor
					language="css"
					height={'380px'}
					{...defaultEditorOption}
					value={cssCode.value}
					onUpdate:value={(value: string) => {
						cssCode.value = value;
					}}
				/>
			</div>
		);
	},
});

const defaultEditorOption = {
	readOnly: false,
	// automaticLayout: true,
	folding: true, // 默认开启折叠代码功能
	wordWrap: 'off',
	formatOnPaste: true,
	fontSize: 12,
	tabSize: 2,
	scrollBeyondLastLine: false,
	fixedOverflowWidgets: false,
	snippetSuggestions: 'top',
	minimap: {
		enabled: false,
	},
	options: {
		lineNumbers: 'off',
		fixedOverflowWidgets: true,
		automaticLayout: true,
		glyphMargin: false,
		folding: false,
		lineDecorationsWidth: 0,
		lineNumbersMinChars: 0,
		hover: {
			enabled: false,
		},
	},
	scrollbar: {
		horizontal: 'auto',
	},
};

/**
 * 将驼峰写法改成xx-xx的css命名写法
 * @param styleKey
 */
function toLine(styleKey: string) {
	return styleKey.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function parseToCssCode(styleData: StyleData) {
	const parseStyleData: any = {};
	for (const styleKey in styleData) {
		parseStyleData[toLine(styleKey)] = styleData[styleKey];
	}

	// 创建一个更符合 cssjson 期望的数据结构
	const cssJson: any = {
		children: {
			'.root': {
				children: {},
				attributes: parseStyleData,
			},
		},
	};

	return toCSS(cssJson);
}

function parseToStyleData(cssCode: string) {
	const styleData: any = {};
	try {
		const cssJson = toJSON(cssCode);
		// 确保我们使用与 parseToCssCode 相同的选择器
		const cssJsonData = cssJson?.children?.['.root']?.attributes || {};
		for (const key in cssJsonData) {
			styleData[toHump(key)] = cssJsonData[key];
		}
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error(e);
	}

	return styleData;
}

function toHump(name: String) {
	// eslint-disable-next-line no-useless-escape
	return name.replace(/\-(\w)/g, (all, letter) => letter.toUpperCase());
}
