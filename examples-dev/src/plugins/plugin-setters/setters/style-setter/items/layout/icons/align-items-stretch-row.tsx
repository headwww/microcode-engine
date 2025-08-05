import { defineComponent } from 'vue';

export const AlignItemsStretchRowIcon = defineComponent({
	name: 'AlignItemsStretchRowIcon',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 16 16"
			>
				<path
					d="M16 15L16 16L0 16L0 15L16 15ZM7.5 2L7.5 14L2.5 14L2.5 2L7.5 2ZM13.5 2L13.5 14L8.5 14L8.5 2L13.5 2ZM16 0L16 1L0 1L0 0L16 0Z"
					fill="currentColor"
				></path>
			</svg>
		);
	},
});
