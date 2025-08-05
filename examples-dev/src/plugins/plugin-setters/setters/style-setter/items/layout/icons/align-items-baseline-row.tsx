import { defineComponent } from 'vue';

export const AlignItemsBaselineRowIcon = defineComponent({
	name: 'AlignItemsBaselineRowIcon',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 16 16"
			>
				<path
					d="M13.5 0L13.5 7.5L16 7.5L16 8.5L13.5 8.5L13.5 12L8.5 12L8.5 8.5L7.5 8.5L7.5 16L2.5 16L2.5 8.5L0 8.5L0 7.5L2.5 7.5L2.5 4L7.5 4L7.5 7.5L8.5 7.5L8.5 0L13.5 0ZM6.5 5L3.5 5L3.5 7.5L6.5 7.5L6.5 5ZM12.5 1L9.5 1L9.5 7.5L12.5 7.5L12.5 1Z"
					fill="currentColor"
				></path>
			</svg>
		);
	},
});
