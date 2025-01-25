import { Component } from 'vue';
import {
	IPublicTypeAssetsJson,
	IPublicTypeDisposable,
	IPublicTypeMetadataTransducer,
	IPublicTypeNpmInfo,
} from '../type';
import { IPublicModelComponentMeta } from '../model';

export interface IPublicApiMaterial {
	/**
	 * 获取组件 map 结构
	 * get map of components
	 */
	get componentsMap(): {
		[key: string]: IPublicTypeNpmInfo | Component<any> | object;
	};

	/**
	 * 设置「资产包」结构
	 *
	 * @returns void
	 */
	setAssets(assets: IPublicTypeAssetsJson): Promise<void>;

	/**
	 * 获取「资产包」结构
	 *
	 * @returns IPublicTypeAssetsJson
	 */
	getAssets(): IPublicTypeAssetsJson | undefined;

	/**
	 * 加载增量的「资产包」结构，该增量包会与原有的合并
	 * @param incrementalAssets
	 * @returns
	 */
	loadIncrementalAssets(incrementalAssets: IPublicTypeAssetsJson): void;

	/**
	 * 注册物料元数据管道函数，在物料信息初始化时执行。
	 * @param transducer
	 * @param level
	 * @param id
	 */
	registerMetadataTransducer(
		transducer: IPublicTypeMetadataTransducer,
		level?: number,
		id?: string | undefined
	): void;

	/**
	 * 获取指定名称的物料元数据
	 * get component meta by component name
	 * @param componentName
	 * @returns
	 */
	getComponentMeta(componentName: string): IPublicModelComponentMeta | null;

	/**
	 * 获取所有物料元数据管道函数
	 */
	getRegisteredMetadataTransducers(): IPublicTypeMetadataTransducer[];

	/**
	 * 获取指定名称的物料元数据
	 * get component meta by component name
	 * @param componentName
	 * @returns
	 */
	getComponentMeta(componentName: string): IPublicModelComponentMeta | null;

	/**
	 * test if the given object is a ComponentMeta instance or not
	 * @param obj
	 * @experiemental unstable API, pay extra caution when trying to use it
	 */
	isComponentMeta(obj: any): boolean;

	/**
	 * 获取所有已注册的物料元数据
	 * get map of all component metas
	 */
	getComponentMetasMap(): Map<string, IPublicModelComponentMeta>;

	/**
	 * 监听 assets 变化的事件
	 * add callback for assets changed event
	 * @param fn
	 */
	onChangeAssets(fn: () => void): IPublicTypeDisposable;
}
