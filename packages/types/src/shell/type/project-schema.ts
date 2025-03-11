import { InterpretDataSource as DataSource } from '@arvin-shu/microcode-datasource-types'; // 修正模块名称
import { IPublicTypeAppConfig } from './app-config';
import { IPublicTypeI18nMap } from './i18n-map';
import { IPublicTypeComponentsMap } from './npm';
import { IPublicTypeRootSchema } from './root-schema';
import {
	IPublicTypeJSExpression,
	IPublicTypeJSFunction,
	IPublicTypeJSONObject,
} from './value-type';
import { IPublicTypeNpmInfo } from './npm-info';

export interface IPublicTypeInternalUtils {
	name: string;
	type: 'function';
	content: IPublicTypeJSFunction | IPublicTypeJSExpression;
}

export interface IPublicTypeExternalUtils {
	name: string;
	type: 'npm' | 'pnpm';
	content: IPublicTypeNpmInfo;
}

export type IPublicTypeUtilItem =
	| IPublicTypeInternalUtils
	| IPublicTypeExternalUtils;
export type IPublicTypeUtilsMap = IPublicTypeUtilItem[];

/**
 * 应用描述
 */
export interface IPublicTypeProjectSchema<T = IPublicTypeRootSchema> {
	id?: string;

	/**
	 * 当前应用协议版本号
	 */
	version: string;

	/**
	 * 当前应用所有组件映射关系
	 */
	componentsMap: IPublicTypeComponentsMap;

	/**
	 * 描述应用所有页面、低代码组件的组件树
	 * 低代码业务组件树描述
	 * 是长度固定为 1 的数组，即数组内仅包含根容器的描述（低代码业务组件容器类型）
	 */
	componentsTree: T[];

	/**
	 * 国际化语料
	 */
	i18n?: IPublicTypeI18nMap;

	/**
	 * 应用范围内的全局自定义函数或第三方工具类扩展
	 */
	utils?: IPublicTypeUtilsMap;

	/**
	 * 应用范围内的全局常量
	 */
	constants?: IPublicTypeJSONObject;

	/**
	 * 当前应用配置信息
	 *
	 */
	config?: IPublicTypeAppConfig & Record<string, unknown>;

	/**
	 * 应用范围内的全局样式
	 */
	css?: string;

	/**
	 * 数据源
	 */
	dataSource?: DataSource;

	/**
	 * 当前应用元数据信息
	 */
	meta?: Record<string, any>;
}
