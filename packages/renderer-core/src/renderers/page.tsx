import { defineComponent } from 'vue';
import { rendererProps, useRenderer, useRootScope } from '../core';

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
	__renderer__: true,
	setup(props) {
		const { scope } = useRootScope(props);

		const { schemaRef, componentsRef, renderComp } = useRenderer(props, scope);

		// TODO 缺少wrapRender

		return () =>
			renderComp(schemaRef.value, scope, componentsRef.value.Page || Page);
	},
});
