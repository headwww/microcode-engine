import {
	IPublicModelComponentMeta,
	IPublicTypeAdvanced,
	IPublicTypeComponentMetadata,
	IPublicTypeDisposable,
	IPublicTypeFieldConfig,
	IPublicTypeI18nData,
	IPublicTypeLiveTextEditingConfig,
	IPublicTypeNestingFilter,
	IPublicTypeNodeData,
	IPublicTypeNodeSchema,
	IPublicTypeNpmInfo,
	IPublicTypeTitleContent,
	IPublicTypeTransformedComponentMetadata,
} from '@arvin-shu/microcode-types';
import { computed, VNode } from 'vue';
import { isNode, isTitleConfig } from '@arvin-shu/microcode-utils';
import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import { isRegExp } from 'lodash';
import { INode, Node } from './document';
import { Designer } from './designer';
import { IconComponent, IconContainer, IconPage } from './icons';

export function ensureAList(list?: string | string[]): string[] | null {
	if (!list) {
		return null;
	}
	if (!Array.isArray(list)) {
		if (typeof list !== 'string') {
			return null;
		}
		list = list.split(/ *[ ,|] */).filter(Boolean);
	}
	if (list.length < 1) {
		return null;
	}
	return list;
}

export function buildFilter(
	rule?: string | string[] | RegExp | IPublicTypeNestingFilter
) {
	if (!rule) {
		return null;
	}
	if (typeof rule === 'function') {
		return rule;
	}
	if (isRegExp(rule)) {
		return (testNode: Node | IPublicTypeNodeSchema) =>
			rule.test(testNode.componentName);
	}
	const list = ensureAList(rule);
	if (!list) {
		return null;
	}
	return (testNode: Node | IPublicTypeNodeSchema) =>
		list.includes(testNode.componentName);
}

export interface IComponentMeta extends IPublicModelComponentMeta<INode> {
	setMetadata(metadata: IPublicTypeComponentMetadata): void;

	get rootSelector(): string | undefined;

	liveTextEditing?: IPublicTypeLiveTextEditingConfig[];

	setMetadata(metadata: IPublicTypeComponentMetadata): void;

	onMetadataChange(fn: (args: any) => void): IPublicTypeDisposable;
}

export class ComponentMeta implements IComponentMeta {
	readonly isComponentMeta = true;

	private emitter: IEventBus = createModuleEventBus('ComponentMeta');

	private _npm: IPublicTypeNpmInfo;

	get npm(): IPublicTypeNpmInfo {
		return this._npm;
	}

	set npm(npm: any) {
		this._npm = npm;
	}

	private _componentName: string;

	get componentName(): string {
		return this._componentName;
	}

	private _isContainer: boolean;

	get isContainer(): boolean {
		return this._isContainer || this.isRootComponent();
	}

	private _isModal?: boolean;

	get isModal(): boolean {
		return this._isModal!;
	}

	private _descriptor?: string;

	get descriptor(): string | undefined {
		return this._descriptor;
	}

	private _liveTextEditing?: IPublicTypeLiveTextEditingConfig[];

	get liveTextEditing() {
		return this._liveTextEditing;
	}

	private _rootSelector?: string;

	get rootSelector(): string | undefined {
		return this._rootSelector;
	}

	private parentWhitelist?: IPublicTypeNestingFilter | null;

	private childWhitelist?: IPublicTypeNestingFilter | null;

	private _transformedMetadata?: IPublicTypeTransformedComponentMetadata;

	get configure(): IPublicTypeFieldConfig[] {
		const config = this._transformedMetadata?.configure;
		return config?.combined || config?.props || [];
	}

	private _isMinimalRenderUnit?: boolean;

	get isMinimalRenderUnit(): boolean {
		return this._isMinimalRenderUnit || false;
	}

	private _title?: IPublicTypeTitleContent;

	get title(): string | IPublicTypeI18nData | VNode {
		if (isTitleConfig(this._title)) {
			return (this._title?.label as any) || this.componentName;
		}
		return this._title || this.componentName;
	}

	private readonly computedIcon = computed(() =>
		this.componentName === 'Page'
			? IconPage
			: this.isContainer
				? IconContainer
				: IconComponent
	);

	get icon() {
		return this.computedIcon.value;
	}

	private _acceptable?: boolean;

	get acceptable(): boolean {
		return this._acceptable!;
	}

	get advanced(): IPublicTypeAdvanced {
		return this.getMetadata().configure.advanced || {};
	}

	constructor(
		readonly designer: Designer,
		data: IPublicTypeComponentMetadata
	) {
		this.parseMetadata(data);
	}

	setNpm(info: IPublicTypeNpmInfo) {
		if (!this._npm) {
			this._npm = info;
		}
	}

	/**
	 * 解析组件元数据
	 * @param metadata
	 */
	private parseMetadata(metadata: IPublicTypeComponentMetadata) {
		const { componentName, npm, ...others } = metadata;
		let _metadata = metadata;

		// 没有注册的组件，只能删除，不支持复制、移动等操作
		if (!npm && !Object.keys(others).length) {
			_metadata = {
				componentName,
				configure: {
					component: {
						disableBehaviors: ['copy', 'move', 'lock', 'unlock'],
					},
					advanced: {
						callbacks: {
							// 移动hook，如果返回值是 false，可以控制组件不可被移动
							onMoveHook: () => false,
						},
					},
				},
			};
		}
		this._npm = npm || this._npm;
		this._componentName = componentName;

		this._transformedMetadata = this.transformMetadata(_metadata);

		const { title } = this._transformedMetadata;
		if (title) {
			// 如果title是字符串，则将其转换为IPublicTypeI18nData格式
			this._title =
				typeof title === 'string'
					? {
							type: 'i18n',
							'en-US': this.componentName,
							'zh-CN': title,
						}
					: title;
		}

		const liveTextEditing = this.advanced.liveTextEditing || [];
		function collectLiveTextEditing(items: IPublicTypeFieldConfig[]) {
			items.forEach((config) => {
				if (config?.items) {
					collectLiveTextEditing(config.items);
				} else {
					const liveConfig =
						config.liveTextEditing || config.extraProps?.liveTextEditing;
					if (liveConfig) {
						liveTextEditing.push({
							propTarget: String(config.name),
							...liveConfig,
						});
					}
				}
			});
		}
		collectLiveTextEditing(this.configure);
		this._liveTextEditing =
			liveTextEditing.length > 0 ? liveTextEditing : undefined;

		const { configure = {} } = this._transformedMetadata;
		// 设置组件是否可以接受拖拽放置，默认为false表示不可接受其他组件拖入
		this._acceptable = false;

		const { component } = configure;
		if (component) {
			this._isContainer = !!component.isContainer;
			this._isModal = !!component.isModal;
			this._descriptor = component.descriptor;
			this._rootSelector = component.rootSelector;
			this._isMinimalRenderUnit = component.isMinimalRenderUnit;
			if (component.nestingRule) {
				const { parentWhitelist, childWhitelist } = component.nestingRule;
				// 将白名单物料协议配置都转换为一个统一的过滤函数(IPublicTypeNestingFilter)
				this.parentWhitelist = buildFilter(parentWhitelist);
				this.childWhitelist = buildFilter(childWhitelist);
			}
		} else {
			this._isContainer = false;
			this._isModal = false;
		}

		this.emitter.emit('metadata_change');
	}

	refreshMetadata() {
		this.parseMetadata(this.getMetadata());
	}

	private transformMetadata(metadata: IPublicTypeComponentMetadata) {
		const registeredTransducers =
			this.designer.componentActions.getRegisteredMetadataTransducers();

		const result = registeredTransducers.reduce(
			(prevMetadata, current) => current(prevMetadata),
			preprocessMetadata(metadata)
		);

		if (!result.configure) {
			result.configure = {};
		}
		return result;
	}

	/**
	 * 是否是根组件
	 * @param includeBlock 是否包含Block
	 * @returns
	 */
	isRootComponent(includeBlock = true): boolean {
		return (
			this.componentName === 'Page' ||
			this.componentName === 'Component' ||
			(includeBlock && this.componentName === 'Block')
		);
	}

	private readonly computedAvailableActions = computed(() => {
		const { disableBehaviors } =
			this._transformedMetadata?.configure.component || {};
		let { actions } = this._transformedMetadata?.configure.component || {};
		const disabled =
			ensureAList(disableBehaviors) ||
			(this.isRootComponent(false)
				? ['copy', 'remove', 'lock', 'unlock']
				: null);
		actions = this.designer.componentActions.actions.concat(
			this.designer.getGlobalComponentActions() || [],
			actions || []
		);

		if (disabled) {
			if (disabled.includes('*')) {
				return actions.filter((action) => action.condition === 'always');
			}
			return actions.filter((action) => disabled.indexOf(action.name) < 0);
		}
		return actions;
	});

	get availableActions() {
		return this.computedAvailableActions.value;
	}

	/**
	 * 设置组件元数据
	 * @param metadata
	 */
	setMetadata(metadata: IPublicTypeComponentMetadata): void {
		this.parseMetadata(metadata);
	}

	getMetadata(): IPublicTypeTransformedComponentMetadata {
		return this._transformedMetadata!;
	}

	/**
	 * 检查当前节点是否可以放置在目标父节点下
	 * @param my 当前节点
	 * @param parent 目标父节点
	 * @returns 是否允许放置
	 */
	checkNestingUp(my: INode | IPublicTypeNodeData, parent: INode) {
		// 检查父子关系，直接约束型，在画布中拖拽直接掠过目标容器
		if (this.parentWhitelist) {
			return this.parentWhitelist(
				parent.internalToShellNode(),
				isNode<INode>(my) ? my.internalToShellNode() : my
			);
		}
		return true;
	}

	/**
	 * 检查目标节点是否可以放置在当前节点下
	 * @param my 当前节点
	 * @param target 目标子节点或节点数组
	 * @returns 是否允许放置
	 */
	checkNestingDown(
		my: INode,
		target: INode | IPublicTypeNodeSchema | IPublicTypeNodeSchema[]
	): boolean {
		// 检查父子关系，直接约束型，在画布中拖拽直接掠过目标容器
		if (this.childWhitelist) {
			// 统一转换为数组处理
			const _target: any = !Array.isArray(target) ? [target] : target;
			// 检查每个目标节点是否都满足白名单要求
			return _target.every((item: Node | IPublicTypeNodeSchema) => {
				// 统一转换为 Node 类型
				const _item = !isNode<INode>(item)
					? new Node(my.document as any, item as any)
					: item;
				return (
					this.childWhitelist &&
					this.childWhitelist(
						_item.internalToShellNode(),
						my.internalToShellNode()
					)
				);
			});
		}
		return true;
	}

	onMetadataChange(fn: (args: any) => void): IPublicTypeDisposable {
		this.emitter.on('metadata_change', fn);
		return () => {
			this.emitter.removeListener('metadata_change', fn);
		};
	}
}

function preprocessMetadata(
	metadata: IPublicTypeComponentMetadata
): IPublicTypeTransformedComponentMetadata {
	if (metadata.configure) {
		// 如果configure是数组，则将其转换为IPublicTypeConfigure格式
		if (Array.isArray(metadata.configure)) {
			return {
				...metadata,
				configure: {
					props: metadata.configure,
				},
			};
		}
		return metadata as any;
	}

	return {
		...metadata,
		configure: {},
	};
}
