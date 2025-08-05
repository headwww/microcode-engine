import { defineComponent } from 'vue';

export const TextAlignCenterIcon = defineComponent({
	name: 'TextAlignCenterIcon',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16px"
				height="16px"
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M3 21v-2h18v2zm4-4v-2h10v2zm-4-4v-2h18v2zm4-4V7h10v2zM3 5V3h18v2z"
				/>
			</svg>
		);
	},
});
