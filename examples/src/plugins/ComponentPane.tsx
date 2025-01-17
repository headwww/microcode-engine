import { IEditor } from '@arvin-shu/microcode-editor-core';
import { IPublicTypeSnippet } from '@arvin-shu/microcode-types';
import { defineComponent, onMounted, PropType, ref } from 'vue';

export const ComponentPane = defineComponent({
	name: 'ComponentPane',
	props: {
		editor: Object as PropType<IEditor>,
	},
	setup(props) {
		const { material, canvas } = window.ArvinMicrocodeEngine;

		const shell = ref<HTMLDivElement>();

		const isNewEngineVersion = !!material;

		onMounted(() => {
			// 绑定布局
			canvas.dragon.from(shell.value, (e: Event) => {
				e;
				return {
					type: 'nodedata',
					data: {
						title: '容器',
						componentName: 'FCell',
					},
				};
			});

			const { editor } = props;

			if (!editor) {
				initComponentList();
				return;
			}
			const assets = isNewEngineVersion
				? material.getAssets()
				: editor.get('assets');
			if (assets) {
				initComponentList();
			} else {
				// eslint-disable-next-line no-console
				console.warn('[ComponentsPane]:资产包为准备就绪');
			}
		});

		/**
		 * 初始化组件列表
		 */
		function initComponentList() {
			const { editor } = props;
			const rawData = isNewEngineVersion
				? material.getAssets()
				: editor?.get('assets');
			const components = rawData.components || [];
			const snippets: IPublicTypeSnippet[] = [];
			components.forEach((component: any) => {
				if (component.snippets) {
					component.snippets.forEach((snippet: any) => {
						snippets.push(snippet);
					});
				}
			});
			componentSnippets.value = snippets;
		}

		const componentSnippets = ref<IPublicTypeSnippet[]>([]);
		return () => (
			<div ref={shell}>
				{componentSnippets.value.map((item: any, index: number) => (
					<div
						style={{
							width: '100px',
							height: '100px',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							border: '1px solid #e8e8e8',
							borderRadius: '4px',
							margin: '10px',
						}}
						key={index}
					>
						<img
							style={{ width: '56px', height: '56px', alignItems: 'center' }}
							src={item.screenshot}
						/>
						{item.title}
					</div>
				))}
			</div>
		);
	},
});
