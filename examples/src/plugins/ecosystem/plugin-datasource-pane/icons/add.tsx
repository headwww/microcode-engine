import { defineComponent } from 'vue';

export const AddIcon = defineComponent({
	name: 'AddIcon',
	setup() {
		return () => (
			<svg
				fill="currentColor"
				preserveAspectRatio="xMidYMid meet"
				width="14"
				height="14"
				viewBox="0 0 1024 1024"
				style="height:23px"
				data-spm-anchor-id="25f841f3.66a768db.0.i111.757c40bdOx0veQ"
			>
				<path
					d="M544 480V95.904A31.808 31.808 0 0 0 512 64c-17.792 0-32 14.272-32 31.904V480H95.904A31.808 31.808 0 0 0 64 512c0 17.792 14.272 32 31.904 32H480v384.096c0 17.824 14.336 31.904 32 31.904 17.792 0 32-14.272 32-31.904V544h384.096A31.808 31.808 0 0 0 960 512c0-17.792-14.272-32-31.904-32H544z"
					data-spm-anchor-id="25f841f3.66a768db.0.i153.757c40bdOx0veQ"
				></path>
			</svg>
		);
	},
});
