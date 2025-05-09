import {
	IPluginPreferenceMananger,
	IPublicApiCanvas,
	IPublicApiEvent,
	IPublicApiHotkey,
	IPublicApiLogger,
	IPublicApiMaterial,
	IPublicApiPlugins,
	IPublicApiProject,
	IPublicApiSetters,
	IPublicApiSkeleton,
} from '../api';
import { IPublicModelEngineConfig } from './engine-config';

export interface IPublicModelPluginContext {
	/**
	 * 可通过该对象读取插件初始化配置
	 */
	preference: IPluginPreferenceMananger;

	/**
	 * skeleton API
	 */
	get skeleton(): IPublicApiSkeleton;

	/**
	 * hotkey API
	 */
	get hotkey(): IPublicApiHotkey;

	/**
	 * plugins api
	 */
	get plugins(): IPublicApiPlugins;

	/**
	 * setter API
	 */
	get setters(): IPublicApiSetters;

	/**
	 * config api
	 */
	get config(): IPublicModelEngineConfig;

	/**
	 * 此事件在全局范围内工作，可以在插件和引擎之间使用。
	 */
	get event(): IPublicApiEvent;

	/**
	 * 此事件在当前插件中工作，在本地发出。
	 */
	get pluginEvent(): IPublicApiEvent;

	/**
	 * logger api
	 */
	get logger(): IPublicApiLogger;

	/**
	 * material api
	 */
	get material(): IPublicApiMaterial;

	/**
	 * canvas API
	 */
	get canvas(): IPublicApiCanvas;

	/**
	 * project API
	 */
	get project(): IPublicApiProject;
}
