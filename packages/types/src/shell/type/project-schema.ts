import { IPublicTypeAppConfig } from './app-config';
import { IPublicTypeI18nMap } from './i18n-map';
import { IPublicTypeComponentsMap } from './npm';
import { IPublicTypeRootSchema } from './root-schema';

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
	 * 当前应用配置信息
	 *
	 */
	config?: IPublicTypeAppConfig & Record<string, unknown>;

	// TODO 还有很多属性没有实现
}
