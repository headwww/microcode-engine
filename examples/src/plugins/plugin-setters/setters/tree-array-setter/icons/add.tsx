import { defineComponent } from 'vue';

export const AddIcon = defineComponent({
	name: 'AddIcon',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				style="vertical-align: middle;opacity: 0.7;"
			>
				<g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd">
					<path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12m10-8a8 8 0 1 0 0 16a8 8 0 0 0 0-16" />
					<path d="M13 7a1 1 0 1 0-2 0v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4z" />
				</g>
			</svg>
		);
	},
});
