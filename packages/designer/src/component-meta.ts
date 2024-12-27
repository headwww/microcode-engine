import {
	IPublicModelComponentMeta,
	IPublicTypeAdvanced,
	IPublicTypeComponentMetadata,
	IPublicTypeDisposable,
	IPublicTypeFieldConfig,
	IPublicTypeI18nData,
	IPublicTypeNestingFilter,
	IPublicTypeNodeSchema,
	IPublicTypeNpmInfo,
	IPublicTypeTitleContent,
	IPublicTypeTransformedComponentMetadata,
} from '@arvin-shu/microcode-types';
import { computed, VNode } from 'vue';
import { isTitleConfig } from '@arvin-shu/microcode-utils';
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
}

export class ComponentMeta implements IComponentMeta {
	readonly isComponentMeta = true;

	private emitter: IEventBus = createModuleEventBus('ComponentMeta');

	private _componentName: string;

	get componentName(): string {
		return this._componentName;
	}

	private _isModal?: boolean;

	get isModal(): boolean {
		return this._isModal!;
	}

	private _descriptor?: string;

	get descriptor(): string | undefined {
		return this._descriptor;
	}

	private _isContainer: boolean;

	get isContainer(): boolean {
		return this._isContainer || this.isRootComponent();
	}

	private _isMinimalRenderUnit?: boolean;

	get isMinimalRenderUnit(): boolean {
		return this._isMinimalRenderUnit || false;
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

	private _npm: IPublicTypeNpmInfo;

	get npm(): IPublicTypeNpmInfo {
		return this._npm;
	}

	set npm(npm: any) {
		this._npm = npm;
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

	get advanced(): IPublicTypeAdvanced {
		return this.getMetadata().configure.advanced || {};
	}

	constructor(
		readonly designer: Designer,
		data: IPublicTypeComponentMetadata
	) {
		this.parseMetadata(data);
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

		// TODO liveTextEditing isTopFixed _acceptable

		const { configure = {} } = this._transformedMetadata;
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
		// TODO 给元数据添加交互能力如锁定，复制，删除等
		const result = preprocessMetadata(metadata);

		if (!result.configure) {
			result.configure = {};
		}
		return result;
	}

	/**
	 * 设置组件npm信息
	 * @param info
	 */
	setNpm(info: IPublicTypeNpmInfo) {
		if (!this._npm) {
			this._npm = info;
		}
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

	// TODO 检查当前节点是否可以放置
	checkNestingUp(): boolean {
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
