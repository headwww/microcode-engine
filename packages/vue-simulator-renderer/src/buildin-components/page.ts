import { defineComponent, h } from 'vue';

const Page = defineComponent(
	(props, { slots }) =>
		() =>
			h('div', { class: 'mtc-page', ...props }, slots)
);

Object.assign(Page, {
	displayName: 'Page',
	componentMetadata: {
		componentName: 'Page',
		configure: {
			supports: {
				style: true,
				className: true,
			},
			component: {
				isContainer: true,
				disableBehaviors: '*',
			},
		},
	},
});

export default Page;
