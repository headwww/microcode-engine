import {
	defineComponent,
	inject,
	nextTick,
	onBeforeUnmount,
	onMounted,
	PropType,
	ref,
} from 'vue';
import { Title } from '@arvin-shu/microcode-editor-core';
import { isObject } from '@arvin-shu/microcode-utils';
import { fieldProps } from './types';
import { intl } from '../../locale';
import { PopupPipeKey } from '../popup';
import { ArrowDownIcon, ClickIcon, InMenuIcon } from '../../icons';

export const Field = defineComponent({
	name: 'Field',
	props: fieldProps,
	inheritAttrs: false,
	setup(props, { slots }) {
		const display = ref(props.defaultDisplay || 'inline');

		const collapsed = ref(props.collapsed || false);

		const toggleExpand = () => {
			const { onExpandChange } = props;
			collapsed.value = !collapsed.value;
			onExpandChange?.(collapsed.value);
		};

		const getTipContent = (propName: string, tip?: any) => {
			let tipContent = (
				<div>
					<div>
						{intl('Attribute: ')}
						{propName}
					</div>
				</div>
			);

			if (isObject(tip)) {
				tipContent = (
					<div>
						<div>
							{intl('Attribute: ')}
							{propName}
						</div>
						<div>
							{intl('Description: ')}
							{(tip as any).content}
						</div>
					</div>
				);
			} else if (tip) {
				tipContent = (
					<div>
						<div>
							{intl('Attribute: ')}
							{propName}
						</div>
						<div>
							{intl('Description: ')}
							{tip}
						</div>
					</div>
				);
			}
			return tipContent;
		};

		const body = ref<HTMLDivElement | null>(null);
		let observer: MutationObserver | null = null;

		/**
		 * 部署区块测试函数
		 * 用于监控和自动切换字段的显示模式
		 */
		const deployBlockTesting = () => {
			// 清理已存在的观察器
			if (observer) {
				observer.disconnect();
			}

			// 获取目标DOM元素
			const bodyElement = body.value;
			if (!bodyElement) return;

			/**
			 * 检查函数：判断显示模式
			 * 通过检查第一个子元素是否为块级设置器来决定显示模式
			 */
			const check = () => {
				const setter = bodyElement.firstElementChild;
				if (setter && setter.classList.contains('mtc-block-setter')) {
					// 包含块级设置器类名，切换为块级显示
					display.value = 'block';
				} else {
					// 不包含块级设置器类名，使用内联显示
					display.value = 'inline';
				}
			};

			// 创建新的 MutationObserver 实例
			observer = new MutationObserver(check);

			// 执行初始检查
			check();

			// 开始观察DOM变化
			observer.observe(bodyElement, {
				childList: true, // 监听子节点变化
				subtree: true, // 监听所有后代节点
				attributes: true, // 监听属性变化
				attributeFilter: ['class'], // 只监听class属性变化
			});
		};

		onMounted(() => {
			const { defaultDisplay } = props;
			if (!defaultDisplay || defaultDisplay === 'inline') {
				deployBlockTesting();
			}
		});

		// 组件卸载前清理资源
		onBeforeUnmount(() => {
			if (observer) {
				observer.disconnect();
				observer = null;
			}
		});

		const clickHandler = (event: MouseEvent) => {
			const { editor, name, title, meta } = props;
			editor?.eventBus.emit('setting.setter.field.click', {
				name,
				title,
				meta,
				event,
			});
		};

		return () => {
			const { title, className, name: propName, tip, meta } = props;

			const children = slots.default ? slots.default() : null;
			const isAccordion = display.value === 'accordion';
			const tipContent = getTipContent(propName!, tip);

			let hostName = '';
			if (typeof meta === 'object') {
				hostName = `${meta?.package || ''}-${meta.componentName || ''}`;
			} else if (typeof meta === 'string') {
				hostName = meta;
			}
			const id = `${hostName}-${propName || (title as any)['en-US'] || (title as any)['zh-CN']}`;

			return (
				<div
					id={id}
					class={[
						'mtc-field',
						`mtc-${display.value}-field`,
						className,
						{
							'mtc-field-is-collapsed': isAccordion && collapsed.value,
						},
					]}
				>
					{display.value !== 'plain' && (
						<div
							class="mtc-field-head"
							onClick={isAccordion ? toggleExpand : undefined}
						>
							<div class="mtc-field-title">
								<Title title={title || ''} onClick={clickHandler}></Title>
								<InlineTip position="top">{tipContent}</InlineTip>
							</div>
							{isAccordion && (
								<ArrowDownIcon
									style={{
										verticalAlign: 'middle',
									}}
									class="mtc-field-icon"
								/>
							)}
						</div>
					)}
					<div key="body" ref={body} class="mtc-field-body">
						{children}
					</div>
				</div>
			);
		};
	},
});

export const PopupField = defineComponent({
	name: 'PopupField',
	inheritAttrs: false,
	props: { ...fieldProps, width: { type: Number, default: 320 } },
	setup(props, { slots }) {
		const context = inject(PopupPipeKey, null);

		const pipe = context?.create({ width: props.width });

		nextTick(() => {
			const children = slots.default ? slots.default() : null;
			pipe?.sent(
				<div class="mtc-field-body">{children}</div>,
				props.title && (
					<div class="mtc-field-title">
						<Title title={props.title}></Title>
					</div>
				)
			);
		});

		return () => {
			const { className, title } = props;

			return (
				<div class={['mtc-field', 'mtc-popup-field', className]}>
					<div
						class="mtc-field-head"
						onClick={(e: any) => pipe?.show(e.target)}
					>
						<div class="mtc-field-title">
							<Title title={title} />
						</div>
						<ClickIcon
							style={{
								opacity: 0.5,
								height: '20px',
								width: '20px',
								verticalAlign: 'middle',
							}}
						/>
					</div>
				</div>
			);
		};
	},
});

export const EntryField = defineComponent({
	name: 'EntryField',
	inheritAttrs: false,
	props: {
		...fieldProps,
		stageName: String,
	},
	setup(props) {
		return () => {
			const { title, className } = props;
			return (
				<div class={['mtc-field', 'mtc-entry-field', className]}>
					<div class="mtc-field-head" data-stage-target={props.stageName}>
						<div class="mtc-field-title">
							<Title title={title || ''}></Title>
						</div>
						<InMenuIcon
							class="mtc-field-icon"
							style={{
								width: '20px',
								height: '20px',
								verticalAlign: 'middle',
							}}
						/>
					</div>
				</div>
			);
		};
	},
});

export const PlainField = defineComponent({
	name: 'PlainField',
	props: fieldProps,
	inheritAttrs: false,
	setup(props, { slots }) {
		return () => {
			const children = slots.default ? slots.default() : null;

			const { className } = props;
			return (
				<div class={['mtc-field', 'mtc-plain-field', className]}>
					<div class="mtc-field-body">{children}</div>
				</div>
			);
		};
	},
});

export const InlineTip = defineComponent({
	name: 'InlineTip',
	inheritAttrs: false,
	props: {
		position: {
			type: String,
			default: 'auto',
		},
		theme: {
			type: String as PropType<'green' | 'black'>,
			default: 'black',
		},
	},
	setup(props, { slots }) {
		return () => {
			const { position, theme } = props;
			const children = slots.default ? slots.default() : null;

			return (
				<div
					style={{ display: 'none' }}
					data-role="tip"
					data-position={position}
					data-theme={theme}
				>
					{children}
				</div>
			);
		};
	},
});
