import { defineComponent } from 'vue';

export default defineComponent({
	name: 'LtPage',
	setup(props, { slots }) {
		return () => (
			<div
				style={{
					width: '100vw',
					height: '100vh',
					overflow: 'hidden',
					position: 'relative',
				}}
				class="lt-page-layout"
			>
				{slots.default?.()}
			</div>
		);
	},
});
