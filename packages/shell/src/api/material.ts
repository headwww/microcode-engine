import {
	IPublicApiMaterial,
	IPublicModelComponentMeta,
	IPublicModelEditor,
	IPublicTypeAssetsJson,
	IPublicTypeComponentMetadata,
	IPublicTypeDisposable,
	IPublicTypeMetadataTransducer,
	IPublicTypeNpmInfo,
} from '@arvin-shu/microcode-types';
import { globalContext } from '@arvin-shu/microcode-editor-core';
import { getLogger } from '@arvin-shu/microcode-utils';
import { IDesigner } from '@arvin-shu/microcode-designer';
import { Component } from 'vue';
import { designerSymbol, editorSymbol } from '../symbols';
import { ComponentMeta as ShellComponentMeta } from '../model';

const innerEditorSymbol = Symbol('editor');

const logger = getLogger({ level: 'warn', bizName: 'shell-material' });

export class Material implements IPublicApiMaterial {
	private readonly [innerEditorSymbol]: IPublicModelEditor;

	get [editorSymbol](): IPublicModelEditor {
		if (this.workspaceMode) {
			return this[innerEditorSymbol];
		}
		const workspace = globalContext.get('workspace');
		if (workspace.isActive) {
			if (!workspace.window.editor) {
				logger.error('Material api 调用时机出现问题，请检查');
				return this[innerEditorSymbol];
			}
			return workspace.window.editor;
		}

		return this[innerEditorSymbol];
	}

	constructor(
		editor: IPublicModelEditor,
		readonly workspaceMode: boolean = false
	) {
		this[innerEditorSymbol] = editor;
	}

	/**
	 * 获取组件 map 结构
	 */
	get componentsMap(): {
		[key: string]: IPublicTypeNpmInfo | Component<any> | object;
	} {
		return this[designerSymbol].componentsMap;
	}

	/**
	 * 获取设计器实例
	 * 设计器实例在引擎注册初始化的时候构建的存储在editor中的
	 */
	get [designerSymbol](): IDesigner {
		return this[editorSymbol].get('designer')!;
	}

	/**
	 * 设置「资产包」结构
	 * @param assets
	 */
	async setAssets(assets: IPublicTypeAssetsJson): Promise<void> {
		return await this[editorSymbol].setAssets(assets);
	}

	/**
	 * 获取「资产包」结构
	 */
	getAssets(): IPublicTypeAssetsJson | undefined {
		return this[editorSymbol].get('assets');
	}

	/**
	 * 加载增量的「资产包」结构，该增量包会与原有的合并
	 * @param incrementalAssets
	 * @returns
	 */
	loadIncrementalAssets(incrementalAssets: IPublicTypeAssetsJson) {
		return this[designerSymbol].loadIncrementalAssets(incrementalAssets);
	}

	/**
	 * 注册物料元数据管道函数
	 * @param transducer
	 * @param level
	 * @param id
	 */
	registerMetadataTransducer = (
		transducer: IPublicTypeMetadataTransducer,
		level?: number,
		id?: string | undefined
	) => {
		this[designerSymbol].componentActions.registerMetadataTransducer(
			transducer,
			level,
			id
		);
	};

	/**
	 * 获取所有物料元数据管道函数
	 * @returns
	 */
	getRegisteredMetadataTransducers() {
		return this[
			designerSymbol
		].componentActions.getRegisteredMetadataTransducers();
	}

	/**
	 * 获取指定名称的物料元数据
	 * @param componentName
	 * @returns
	 */
	getComponentMeta(componentName: string): IPublicModelComponentMeta | null {
		const innerMeta = this[designerSymbol].getComponentMeta(componentName);
		return ShellComponentMeta.create(innerMeta);
	}

	createComponentMeta(metadata: IPublicTypeComponentMetadata) {
		return ShellComponentMeta.create(
			this[designerSymbol].createComponentMeta(metadata)
		);
	}

	isComponentMeta(obj: any): boolean {
		return this.isComponentMeta(obj);
	}

	/**
	 * 获取所有已注册的物料元数据
	 * @returns
	 */
	getComponentMetasMap(): Map<string, IPublicModelComponentMeta> {
		const map = new Map<string, IPublicModelComponentMeta>();
		const originalMap = this[designerSymbol].getComponentMetasMap();
		for (const componentName of originalMap.keys()) {
			map.set(componentName, this.getComponentMeta(componentName)!);
		}
		return map;
	}

	/**
	 * 监听 assets 变化的事件
	 * @param fn
	 */
	onChangeAssets(fn: () => void): IPublicTypeDisposable {
		const disable = [
			// 设置 assets，经过 setAssets 赋值
			this[editorSymbol].onChange('assets', fn),
			// 增量设置 assets，经过 loadIncrementalAssets 赋值
			this[editorSymbol].eventBus.on('designer.incrementalAssetsReady', fn),
		];
		return () => {
			disable.forEach((d) => d && d());
		};
	}

	// TODO: 其他方法
}
