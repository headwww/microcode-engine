import { defineComponent } from 'vue';

export const FlexDirectionRowReverseIcon = defineComponent({
	name: 'FlexDirectionRowReverseIcon',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 16 16"
			>
				<path
					d="M11 2L11 14L16 14L16 2L11 2ZM6 2L6 14L10 14L10 2L6 2ZM3 4L0 8L3 12L3.0005 9L5 9L5 7L3 7L3 4Z"
					fill="currentColor"
				></path>
			</svg>
		);
	},
});
