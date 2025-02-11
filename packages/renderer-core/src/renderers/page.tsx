import { defineComponent } from 'vue';
import { rendererProps, useRenderer, useRootScope } from '../core';

const Page = defineComponent({
	name: 'Page',
	setup(props, { slots }) {
		return () => (
			<div class="mtc-page" {...props}>
				{slots.default?.()}
			</div>
		);
	},
});

export const PageRenderer = defineComponent({
	name: 'PageRenderer',
	props: rendererProps,
	__renderer__: true,
	setup(props, context) {
		const { scope, wrapRender } = useRootScope(props, context);
		const { renderComp, componentsRef, schemaRef } = useRenderer(props, scope);

		return wrapRender(() =>
			renderComp(schemaRef.value, scope, componentsRef.value.Page || Page)
		);
	},
});
