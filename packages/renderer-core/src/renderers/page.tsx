import { defineComponent } from 'vue';
import { rendererProps } from '../core';

const Page = defineComponent({
	name: 'Page',
	setup(props, { slots }) {
		return () => (
			<div class="mtc-page" style={{ height: '100%' }} {...props}>
				{slots.default?.()}
			</div>
		);
	},
});

export const PageRenderer = defineComponent({
	name: 'PageRenderer',
	props: rendererProps,
	setup() {
		return () => <Page></Page>;
	},
});
