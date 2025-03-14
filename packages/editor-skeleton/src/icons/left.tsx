import { defineComponent } from 'vue';

export const LeftIcon = defineComponent({
	name: 'LeftIcon',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18px"
				height="18px"
				viewBox="0 0 20 20"
				style={{
					verticalAlign: 'middle',
				}}
			>
				<path
					fill="currentColor"
					fill-rule="evenodd"
					d="M7.222 9.897q3.45-3.461 6.744-6.754a.65.65 0 0 0 0-.896c-.311-.346-.803-.316-1.027-.08Q9.525 5.59 5.796 9.322q-.296.243-.296.574t.296.592l7.483 7.306a.75.75 0 0 0 1.044-.029c.358-.359.22-.713.058-.881a3408 3408 0 0 1-7.16-6.988"
				/>
			</svg>
		);
	},
});
