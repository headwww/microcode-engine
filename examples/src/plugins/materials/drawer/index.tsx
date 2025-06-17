import { defineComponent, inject, PropType, ref } from 'vue';
import { Drawer as OriginalDrawer } from 'ant-design-vue';

export default defineComponent({
	name: 'LtDrawer',
	inheritAttrs: false,
	props: {
		// eslint-disable-next-line vue/prop-name-casing
		title: {
			type: String,
			default: '',
		},
		width: {
			type: [String, Number],
			default: '500px',
		},
		height: {
			type: [String, Number],
		},
		centered: {
			type: Boolean,
			default: true,
		},
		onOk: {
			type: Function as PropType<() => void>,
		},
		onCancel: {
			type: Function as PropType<() => void>,
		},
	},
	setup(props, { slots, expose }) {
		const designMode = inject<string>('__designMode', 'live');

		const open = ref(designMode === 'design');

		const params = ref<any>();

		// 获取iframe中的目标容器
		const getIframeContainer = () => {
			// 查找iframe中class为engine-document的body元素
			if (designMode === 'design') {
				const iframes = document.querySelectorAll('iframe');
				for (const iframe of iframes) {
					try {
						const doc =
							iframe.contentDocument || iframe.contentWindow?.document;
						if (doc) {
							const engineBody = doc.querySelector('body.engine-document');
							if (engineBody) return engineBody as any;
						}
					} catch (e) {
						// eslint-disable-next-line no-console
						console.error('访问iframe内容时出错:', e);
						return document.body;
					}
				}
				// 找不到则返回当前document.body
				return document.body;
			}
			return document.body;
		};

		function openDrawer(data?: any) {
			open.value = true;
			params.value = data;
		}

		function closeDrawer() {
			open.value = false;
			params.value = undefined;
		}

		expose({
			open: openDrawer,
			close: closeDrawer,
		});

		return () => (
			<OriginalDrawer
				v-model:open={open.value}
				title={props.title}
				getContainer={getIframeContainer}
				width={props.width}
				centered={props.centered}
				onOk={props.onOk}
				maskClosable={false}
				onCancel={props.onCancel}
			>
				<div style={{ height: props.height }}>{slots.default?.()}</div>
			</OriginalDrawer>
		);
	},
});
