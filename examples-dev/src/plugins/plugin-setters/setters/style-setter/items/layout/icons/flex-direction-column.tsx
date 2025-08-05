import { defineComponent } from 'vue';

export const FlexDirectionColumnIcon = defineComponent({
	name: 'FlexDirectionColumnIcon',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 16 16"
			>
				<path
					d="M14 5L2 5L2 0L14 0L14 5ZM14 10L2 10L2 6L14 6L14 10ZM12 13L8 16L4 13L7 12.9995L7 11L9 11L9 13L12 13Z"
					fill="currentColor"
				></path>
			</svg>
		);
	},
});
