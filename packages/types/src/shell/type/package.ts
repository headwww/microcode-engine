import { EitherOr } from '../../utils';

export type IPublicTypePackage = EitherOr<
	{
		/**
		 * npm 包名
		 */
		package: string;

		/**
		 * 包唯一标识
		 */
		id: string;

		/**
		 * 包版本号
		 */
		version: string;

		/**
		 * 组件渲染态视图打包后的 CDN url 列表，包含 js 和 css
		 */
		urls?: string[] | any;

		/**
		 * 组件编辑态视图打包后的 CDN url 列表，包含 js 和 css
		 */
		editUrls?: string[] | any;

		/**
		 * 作为全局变量引用时的名称
		 */
		library: string;

		/**
		 *异步加载的库
		 */
		async?: boolean;

		/**
		 * 标识当前 package 从其他 package 的导出方式
		 */
		exportMode?: 'functionCall';

		/**
		 * 标识当前 package 是从 window 上的哪个属性导出来的
		 */
		exportSourceLibrary?: any;

		/**
		 * 组件描述导出名字，可以通过 window[exportName] 获取到组件描述的 Object 内容；
		 */
		exportName?: string;
	},
	'package',
	'id'
>;
