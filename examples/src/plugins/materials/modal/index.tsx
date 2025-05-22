import { defineComponent } from 'vue';
import { Modal as OriginalModal } from 'ant-design-vue';

export default defineComponent({
	name: 'Modal',
	inheritAttrs: false,
	setup(props, { attrs, slots }) {
		// 获取iframe中的目标容器
		const getIframeContainer = () => {
			// 查找iframe中class为engine-document的body元素
			const iframes = document.querySelectorAll('iframe');
			for (const iframe of iframes) {
				try {
					const doc = iframe.contentDocument || iframe.contentWindow?.document;
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
		};

		return () => (
			<OriginalModal {...attrs} getContainer={getIframeContainer}>
				{slots.default?.()}
			</OriginalModal>
		);
	},
});
