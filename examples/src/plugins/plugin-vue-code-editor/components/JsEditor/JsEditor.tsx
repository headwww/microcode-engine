import MonacoEditor from '@arvin-shu/microcode-plugin-base-monaco-editor';
import { defineComponent, onMounted, PropType, Ref, ref } from 'vue';
import {
	IPublicApiMaterial,
	IPublicTypeRootSchema,
} from '@arvin-shu/microcode-types';
import { generate } from 'short-uuid';
import { parse } from 'acorn';
import MagicString from 'magic-string';
import vueTypeCode from './types/vue';
import vueRouterTypeCode from './types/vue-router';
import { findOptionNode, parseCode } from './parse';

export interface FunctionEventParams {
	functionName: string;
	template?: string;
}

export interface JsEditorInst {
	code: Ref<string>;
	monaco: Ref<any>;
	addFunction(params: FunctionEventParams): void;
	focusByFunctionName(name: string): void;
	transformSchema(
		rawSchema: IPublicTypeRootSchema
	): IPublicTypeRootSchema | void;
}

function getLibraryMap(material: IPublicApiMaterial) {
	const packages = material.getAssets()?.packages ?? [];
	const packageMap: Record<string, string> = {
		vue: 'Vue',
		'vue-router': 'VueRouter',
	};
	packages.forEach(({ package: _pkg, library }) => {
		if (_pkg) {
			packageMap[_pkg] = library;
		}
	});
	return packageMap;
}

export const JsEditor = defineComponent({
	name: 'JsEditor',
	inheritAttrs: false,
	props: {
		code: {
			type: String,
			default: '',
		},
		material: {
			type: Object as PropType<IPublicApiMaterial>,
			required: true,
		},
	},
	emits: ['change'],
	setup(props, { expose, emit }) {
		const code = ref(props.code);

		const editorRef = ref();
		const monacoRef = ref();
		const initEditor = (monaco: any, editor: any) => {
			editorRef.value = editor;
			monacoRef.value = monaco;

			monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
				noSemanticValidation: false,
				noSyntaxValidation: false,
				noSuggestionDiagnostics: true,
			});

			monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
				target: monaco.languages.typescript.ScriptTarget.ESNext,
				allowNonTsExtensions: true,
				moduleResolution:
					monaco.languages.typescript.ModuleResolutionKind.NodeJs,
				module: monaco.languages.typescript.ModuleKind.ESNext,
				noEmit: true,
				esModuleInterop: true,
				jsx: monaco.languages.typescript.JsxEmit.Preserve,
				allowJs: true,
				typeRoots: ['node_modules/@types'],
			});
			monaco.languages.typescript.typescriptDefaults.addExtraLib(
				vueTypeCode,
				'vue.d.ts'
			);
			monaco.languages.typescript.typescriptDefaults.addExtraLib(
				vueRouterTypeCode,
				'vue-router.d.ts'
			);
		};

		const instance: JsEditorInst = {
			code,
			monaco: monacoRef,
			transformSchema: (raw) => {
				const vCode = code.value;
				const transformed = { ...raw };
				const libraryMap = getLibraryMap(props.material);
				const { state, methods, lifeCycles } = parseCode(
					transformed.id || (transformed.id = generate()),
					vCode,
					libraryMap
				);

				Object.keys(state).length > 0
					? (transformed.state = state)
					: delete transformed.state;

				Object.keys(methods).length > 0
					? (transformed.methods = methods)
					: delete transformed.methods;

				Object.keys(lifeCycles).length > 0
					? (transformed.lifeCycles = lifeCycles)
					: delete transformed.lifeCycles;

				(transformed.meta ?? (transformed.meta = {})).originCode = code;

				return transformed;
			},
			focusByFunctionName(name: string) {
				const monacoEditor = editorRef.value;
				const model = monacoEditor?.getModel();
				const matchedResult =
					model &&
					'findMatches' in model &&
					model.findMatches(
						`^\\s*(?:async)?\\s*${name}\\s*\\([\\s\\S]*\\)[\\s\\S]*\\{`,
						false,
						true,
						false,
						null,
						false
					)?.[0];
				if (matchedResult) {
					setTimeout(() => {
						if (monacoEditor) {
							monacoEditor.revealLineInCenter(
								matchedResult.range.startLineNumber
							);
							monacoEditor.setPosition({
								column: matchedResult.range.endColumn,
								lineNumber: matchedResult.range.endLineNumber,
							});
							monacoEditor.focus();
						}
					}, 100);
				}
			},

			addFunction(params: FunctionEventParams) {
				const monaco = monacoRef.value;
				const editor = editorRef.value;

				if (!monaco || !editor) return;

				const model = editor.getModel();
				if (!model) return;

				const ast = parse(code.value, {
					ecmaVersion: 'latest',
					sourceType: 'module',
				});
				const methodNode = findOptionNode(ast, 'methods');
				const s = new MagicString(code.value);
				const indentStr = s.getIndentString();
				const functionCode = params.template
					? params.template
					: `${params.functionName}() {\n}`;

				const indent = (
					code: string,
					indentStart: boolean,
					count = 1
				): string => {
					let s = new MagicString(code);
					while (count--) {
						s = s.indent(indentStr, { indentStart });
					}
					return s.toString();
				};

				if (methodNode) {
					if (methodNode.type === 'ObjectExpression') {
						const propertyLen = methodNode.properties.length;
						if (propertyLen > 0) {
							const lastProperty = methodNode.properties[propertyLen - 1];
							s.appendRight(
								lastProperty.end,
								`,\n${indent(functionCode, true, 2)}`
							);
						} else {
							const { start, end } = methodNode;
							const content = indent(
								`{\n${indent(functionCode, true)}\n}`,
								false
							);
							s.overwrite(start, end, content.toString());
						}
					} else {
						// eslint-disable-next-line no-console
						console.error(
							'[vue-code-editor]: 组件 methdos 选项不是对象字面量，无法自动注册事件处理函数'
						);
					}
				} else {
					const rootNode = findOptionNode(ast, 'root');
					if (rootNode) {
						const propertyLen = rootNode.properties.length;
						if (propertyLen > 0) {
							const lastProperty = rootNode.properties[propertyLen - 1];
							const methodsCode = `\nmethods: {\n${indent(functionCode, true)}\n}`;
							s.appendRight(lastProperty.end, `,${indent(methodsCode, true)}`);
						} else {
							const { start, end } = rootNode;
							const methodsCode = `methods: {\n${indent(functionCode, true, 1)}\n}`;
							s.overwrite(start, end, `{\n${indent(methodsCode, true)}\n}`);
						}
					} else {
						// eslint-disable-next-line no-console
						console.error(
							'[vue-code-editor]: 组件 Options 未找到，无法自动注册事件处理函数'
						);
					}
				}

				model.setValue(s.toString());
				params.functionName && this.focusByFunctionName(params.functionName);
			},
		};

		onMounted(() => {
			expose(instance);
		});

		return () => (
			<MonacoEditor
				language="typescript"
				height="100%"
				style={{ height: '100%' }}
				value={code.value}
				editorDidMount={initEditor}
				onChange={(value) => {
					code.value = value;
					emit('change', value);
				}}
			></MonacoEditor>
		);
	},
});
