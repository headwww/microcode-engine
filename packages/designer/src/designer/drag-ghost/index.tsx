import { defineComponent, onBeforeUnmount, PropType, ref, VNode } from 'vue';
import { Title } from '@arvin-shu/microcode-editor-core';
import {
	IPublicModelDragObject,
	IPublicTypeI18nData,
	IPublicTypeNodeSchema,
} from '@arvin-shu/microcode-types';
import { Designer } from '../designer';

// 定义一个函数类型,用于解绑事件监听器
// 返回任意类型,通常用于清理资源或取消订阅
type offBinding = () => any;

export const DragGhost = defineComponent({
	name: 'DragGhost',
	props: {
		designer: Object as PropType<Designer>,
	},
	setup({ designer }) {
		let dispose: offBinding[] = [];

		const titles = ref<Array<string | IPublicTypeI18nData | VNode>>();

		const { dragon } = designer!;

		const x = ref(0);

		const y = ref(0);

		dispose = [
			dragon.onDragstart((e) => {
				if (e.dragObject) {
					titles.value = getTitles(e.dragObject) as any;
				}
			}),
			dragon.onDrag((e) => {
				x.value = e.globalX;
				y.value = e.globalY;
			}),
			dragon.onDragend((e) => {
				console.log(e);
			}),
		];

		function getTitles(dragObject: IPublicModelDragObject) {
			const dataList = Array.isArray(dragObject.data)
				? dragObject.data
				: [dragObject.data];

			return dataList.map((item: IPublicTypeNodeSchema | null) =>
				item ? designer?.getComponentMeta(item.componentName).title : null
			);
		}

		function renderGhostGroup() {
			return titles.value?.map((title, i) => {
				const ghost = (
					<div class="mtc-ghost" key={i}>
						<Title title={title}> </Title>
					</div>
				);
				return ghost;
			});
		}

		onBeforeUnmount(() => {
			if (dispose) {
				dispose.forEach((item) => item());
			}
		});

		return () => {
			if (!titles.value || !titles.value.length) {
				return null;
			}

			return (
				<div
					class="mtc-ghost-group"
					style={{
						left: `${x.value}px`,
						top: `${y.value}px`,
					}}
				>
					{renderGhostGroup()}
				</div>
			);
		};
	},
});
