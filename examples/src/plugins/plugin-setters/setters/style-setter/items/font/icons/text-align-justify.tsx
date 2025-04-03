import { defineComponent } from 'vue';

export const TextAlignJustifyIcon = defineComponent({
	name: 'TextAlignJustifyIcon',
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
					d="M3 21v-2h18v2zm0-4v-2h18v2zm0-4v-2h18v2zm0-4V7h18v2zm0-4V3h18v2z"
				/>
			</svg>
		);
	},
});
