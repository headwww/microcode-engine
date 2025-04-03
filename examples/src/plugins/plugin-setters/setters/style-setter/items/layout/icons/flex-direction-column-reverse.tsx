import { defineComponent } from 'vue';

export const FlexDirectionColumnReverseIcon = defineComponent({
	name: 'FlexDirectionColumnReverseIcon',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 16 16"
			>
				<path
					d="M14 11L2 11L2 16L14 16L14 11ZM14 6L2 6L2 10L14 10L14 6ZM12 3L8 0L4 3L7 3.0005L7 5L9 5L9 3L12 3Z"
					fill="currentColor"
				></path>
			</svg>
		);
	},
});
