import {
	defineComponent,
	onBeforeUnmount,
	onMounted,
	onUpdated,
	PropType,
	ref,
} from 'vue';
import { isTitleConfig } from '@arvin-shu/microcode-utils';
import { Stage as StageWidget } from '../../widget/stage';
import { HomeIcon, LeftIcon } from '../../icons';

export const Stage = defineComponent({
	name: 'Stage',
	props: {
		stage: {
			type: Object as PropType<StageWidget>,
		},
		current: Boolean,
		direction: String,
	},
	setup(props) {
		onMounted(() => {
			doSkate();
		});

		onUpdated(() => {
			doSkate();
		});

		let timer: any;

		const additionClassName = ref();

		const shell = ref<HTMLDivElement>();

		function doSkate() {
			window.clearTimeout(timer);
			if (additionClassName.value) {
				timer = window.setTimeout(() => {
					const elem = shell.value;
					if (elem) {
						if (props.current) {
							elem.classList.remove(additionClassName.value);
						} else {
							elem.classList.add(additionClassName.value);
						}
						additionClassName.value = null;
					}
				}, 15);
			}
		}

		onBeforeUnmount(() => {
			window.clearTimeout(timer);
		});

		return () => {
			const { stage, current, direction } = props;

			const content = stage?.getContent();

			const { title } = stage!;

			const newTitle = isTitleConfig(title) ? title.label : title;

			if (current) {
				if (direction) {
					additionClassName.value = `skeleton-stagebox-stagein-${direction}`;
				}
			} else if (direction) {
				additionClassName.value = `skeleton-stagebox-stageout-${direction}`;
			}

			const stageBacker = stage?.hasBack() ? (
				<div class="skeleton-stagebox-stagebacker">
					<LeftIcon
						class="skeleton-stagebox-stage-arrow"
						data-stage-target="stageback"
					/>
					<span class="skeleton-stagebox-stage-title">{newTitle}</span>
					<HomeIcon
						class="skeleton-stagebox-stage-exit"
						data-stage-target="stageexit"
					/>
				</div>
			) : null;

			return (
				<div
					ref={shell}
					class={[
						'skeleton-stagebox-stage',
						{
							'skeleton-stagebox-refer': !current,
						},
						additionClassName.value,
					]}
				>
					{stageBacker}
					<div class="skeleton-stagebox-stage-content">{content}</div>
				</div>
			);
		};
	},
});
