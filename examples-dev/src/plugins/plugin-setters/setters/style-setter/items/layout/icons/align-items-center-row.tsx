import { defineComponent } from 'vue';

export const AlignItemsCenterRowIcon = defineComponent({
	name: 'AlignItemsCenterRowIcon',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 16 16"
			>
				<path
					d="M7.5 1L7.5 7.5L8.5 7.5L8.5 1L13.5 1L13.5 7.5L16 7.5L16 8.5L13.5 8.5L13.5 15L8.5 15L8.5 8.5L7.5 8.5L7.5 15L2.5 15L2.5 8.5L0 8.5L0 7.5L2.5 7.5L2.5 1L7.5 1Z"
					fill="currentColor"
				></path>
			</svg>
		);
	},
});
