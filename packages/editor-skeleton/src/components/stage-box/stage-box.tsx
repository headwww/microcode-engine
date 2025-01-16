import {
	defineComponent,
	onBeforeUnmount,
	onMounted,
	PropType,
	ref,
	VNode,
} from 'vue';
import { StageChain } from './stage-chain';
import { ISkeleton } from '../../skeleton';
import { Stage as StageWidget } from '../../widget/stage';
import { Stage } from './stage';
import { PopupPipe, PopupService } from '../popup';

type WillDetachMember = () => void;

export const StageBox = defineComponent({
	name: 'StageBox',
	inheritAttrs: false,
	props: {
		stageName: String,
		stageChain: Object as PropType<StageChain>,
		skeleton: Object as PropType<ISkeleton>,
		className: String,
		children: Object as PropType<VNode>,
	},
	setup(props) {
		let stageChain: StageChain;

		const willDetach: WillDetachMember[] = [];

		const shell = ref<HTMLDivElement | null>(null);

		onMounted(() => {
			/**
			 * 向上层递归寻找 target
			 * @param node 节点
			 * @returns 节点的 dataset.stageTarget 信息
			 */
			const getTarget = (node: HTMLElement | null): null | string => {
				if (
					!node ||
					!shell.value?.contains(node) ||
					(node.nodeName === 'A' && node.getAttribute('href'))
				) {
					return null;
				}

				const target = node.dataset ? node.dataset.stageTarget : null;
				if (target) {
					return target;
				}
				return getTarget(node.parentNode as HTMLElement);
			};

			const click = (e: MouseEvent) => {
				const target = getTarget(e.target as HTMLElement);
				if (!target) {
					return;
				}

				if (target === 'stageback') {
					stageChain.stageBack();
				} else if (target === 'stageexit') {
					stageChain.stageBackToRoot();
				} else {
					const { skeleton } = props;
					stageChain.stagePush(skeleton!.getStage(target));
				}
			};

			shell.value?.addEventListener('click', click, false);
			willDetach.push(() =>
				shell.value?.removeEventListener('click', click, false)
			);
		});

		onBeforeUnmount(() => {
			willDetach.forEach((fn) => fn());
		});

		const forceUpdate = ref(0); // 添加一个用于强制更新的ref

		const popupPipe = new PopupPipe();

		popupPipe.create();

		const {
			stageChain: stageChainProps,
			skeleton,
			className,
			children,
		} = props;

		if (stageChainProps) {
			stageChain = stageChainProps;
		} else {
			const stateName = skeleton?.createStage({
				content: children,
				isRoot: true,
			});
			stageChain = new StageChain(
				skeleton?.getStage(stateName as string) as StageWidget
			);

			// 强制刷新
			willDetach.push(
				stageChain.onStageChange(() => {
					forceUpdate.value++;
				})
			);
		}

		return () => {
			const stage = stageChain.getCurrentStage();
			const refer = stage?.getRefer();

			let contentCurrent = null;
			let contentRefer = null;

			if (refer) {
				contentCurrent = (
					<Stage
						key={stage.getId()}
						stage={stage}
						direction={refer.direction}
						current
					/>
				);
				contentRefer = (
					<Stage
						key={refer?.stage?.getId()}
						stage={refer?.stage}
						direction={refer.direction}
					/>
				);
			} else {
				contentCurrent = <Stage key={stage.getId()} stage={stage} current />;
			}

			forceUpdate.value;

			return (
				<div ref={shell} class={['skeleton-stagebox', className]}>
					<PopupService popupPipe={popupPipe}>
						{contentRefer}
						{contentCurrent}
					</PopupService>
				</div>
			);
		};
	},
});
