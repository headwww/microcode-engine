import { defineComponent, PropType, ref } from 'vue';
import { Modal as OriginalModal } from 'ant-design-vue';

export default defineComponent({
	name: 'LtModal',
	inheritAttrs: false,
	props: {
		// eslint-disable-next-line vue/prop-name-casing
		__designMode: {
			type: String as PropType<'live' | 'design'>,
			default: 'live',
		},

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
		const open = ref(props.__designMode === 'design');

		const params = ref<any>();

		// 获取iframe中的目标容器
		const getIframeContainer = () => {
			// 查找iframe中class为engine-document的body元素
			if (props.__designMode === 'design') {
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

		function openModal(data?: any) {
			open.value = true;
			params.value = data;
		}

		function closeModal() {
			open.value = false;
			params.value = undefined;
		}

		expose({
			open: openModal,
			close: closeModal,
		});

		return () => (
			<OriginalModal
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
			</OriginalModal>
		);
	},
});
