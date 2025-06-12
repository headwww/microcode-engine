import { CloseOutlined } from '@ant-design/icons-vue';
import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import { uniqueId } from '@arvin-shu/microcode-utils';
import { Button, Popover, ConfigProvider } from 'ant-design-vue';
import {
	defineComponent,
	inject,
	InjectionKey,
	onBeforeUnmount,
	PropType,
	provide,
	ref,
	VNode,
	Fragment,
} from 'vue';

export const PopupPipeKey: InjectionKey<PopupPipe | undefined> =
	Symbol('PopupPipe');

export interface PopupExtProps {
	width?: number;
}

interface PopupProps extends PopupExtProps {
	content?: VNode;
	title?: VNode;
	actionKey?: string;
}
export class PopupPipe {
	private emitter: IEventBus = createModuleEventBus('PopupPipe');

	private currentId?: string;

	create(props?: PopupExtProps) {
		let sendContent: VNode;
		let sendTitle: VNode;
		const id = uniqueId('popup');

		return {
			sent: (content: VNode, title: VNode) => {
				sendContent = content;
				sendTitle = title;
				if (this.currentId === id) {
					this.popup({
						...props,
						content,
						title,
					});
				}
			},
			show: (target?: Element, actionKey?: string) => {
				this.currentId = id;
				this.popup(
					{
						...props,
						actionKey,
						content: sendContent,
						title: sendTitle,
					},
					target
				);
			},
		};
	}

	private popup(props: PopupProps, target?: Element) {
		Promise.resolve().then(() => {
			this.emitter.emit('popupchange', props, target);
		});
	}

	onPopupChange(fn: (props: PopupProps, target?: Element) => void): () => void {
		this.emitter.on('popupchange', fn);
		return () => {
			this.emitter.removeListener('popupchange', fn);
		};
	}
}

export const PopupService = defineComponent({
	name: 'PopupService',
	props: {
		popupPipe: {
			type: Object as PropType<PopupPipe>,
		},
		safeId: String,
		popupContainer: String,
		actionKey: String,
	},
	setup(props, { slots }) {
		provide(PopupPipeKey, props.popupPipe || new PopupPipe());

		return () => {
			const children = slots.default ? slots.default() : null;

			const { actionKey, safeId, popupContainer } = props;
			return (
				<Fragment>
					{children}
					<PopupContent
						key={`pop${actionKey}`}
						safeId={safeId}
						popupContainer={popupContainer}
					></PopupContent>
				</Fragment>
			);
		};
	},
});

export const PopupContent = defineComponent({
	name: 'PopupContent',
	props: {
		safeId: String,
		popupContainer: String,
		actionKey: String,
	},
	setup(props) {
		const visible = ref(false);

		const position = ref({ top: 0, height: 0 });

		const context = inject(PopupPipeKey);

		const content = ref(<Fragment></Fragment>);

		const title = ref(<Fragment></Fragment>);

		const popupContainerId = uniqueId('popupContainer');

		const width = ref(320);

		const dispose = context?.onPopupChange((props, target) => {
			visible.value = true;
			content.value = props.content;
			title.value = props.title;
			width.value = props.width || 320;
			if (target) {
				const rect = target.getBoundingClientRect();
				position.value = {
					top: rect.top,
					height: rect.height,
				};
			}
		});

		onBeforeUnmount(() => {
			dispose && dispose();
		});

		return () => {
			const id = uniqueId('ball');

			return (
				<Popover
					destroyTooltipOnHide
					open={visible.value}
					onUpdate:open={(value) => {
						// 如果出现从Popover打开的弹窗，则给这个弹窗的父级添加data-id="mtc-popup-overlay"
						// 当弹窗被聚焦时候Popover不会被关闭
						const elements = document.querySelectorAll(
							'[data-id="mtc-popup-overlay"]'
						);
						if (elements.length > 0) {
							visible.value = true;
						} else {
							visible.value = value;
						}
					}}
					overlayClassName="mtc-popup-overlay"
					overlayInnerStyle={{
						width: `${width.value}px`,
					}}
					placement="left"
					trigger="click"
					id={props.safeId}
					arrow={false}
				>
					{{
						default: () => (
							<div
								class="mtc-popup-placeholder"
								style={{
									top: `${position.value.top}px`,
									height: `${position.value.height}px`,
								}}
							></div>
						),
						content: () => (
							<Fragment>
								<div class="mtc-ballon-header">
									<div class="mtc-ballon-title">{title.value}</div>
									<Button
										type="text"
										size="small"
										onClick={() => {
											visible.value = false;
										}}
										icon={
											<CloseOutlined style="color: #999; font-size: 12px" />
										}
									></Button>
								</div>
								<PopupService
									actionKey={props.actionKey}
									safeId={id}
									popupContainer={popupContainerId}
								>
									<ConfigProvider
										getPopupContainer={() =>
											document.getElementById(popupContainerId)!
										}
									>
										{content.value}
									</ConfigProvider>
								</PopupService>
								<div id={popupContainerId}></div>
							</Fragment>
						),
					}}
				</Popover>
			);
		};
	},
});
