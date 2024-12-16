import { computed, ExtractPropTypes, PropType, Ref, ref, watch } from 'vue';
import {
	Asset,
	AssetLevel,
	AssetList,
	AssetType,
	IPublicModelLocateEvent,
	IPublicTypePackage,
} from '@arvin-shu/microcode-types';
import { assetBundle, assetItem } from '@arvin-shu/microcode-utils';
import { Designer, IDesigner, ILocateEvent } from '../designer';
import { IProject, Project } from '../project';
import { ISimulatorHost } from '../simulator';
import { createSimulator } from './create-simulator';
import Viewport from './viewport';

export type LibraryItem = IPublicTypePackage & {
	package: string;
	library: string;
	urls?: Asset;
	editUrls?: Asset;
};

export const builtinSimulatorProps = {
	library: Array as PropType<LibraryItem[]>,
	simulatorUrl: [Object, String] as PropType<Asset>,
	extraEnvironment: [Object, String] as PropType<Asset>,
	device: {
		type: String as PropType<'mobile' | 'iphone' | 'default' | string>,
	},
	renderEnv: {
		type: String as PropType<'vue' | 'rax' | 'react' | 'default' | string>,
	},
	locale: String,
	deviceClassName: String,
};

const defaultEnvironment = [
	assetItem(AssetType.JSText, 'window.Vue=parent.Vue', undefined, 'vue'),
];

export type BuiltinSimulatorProps = ExtractPropTypes<
	typeof builtinSimulatorProps
> & {
	[key: string]: any;
};

export class BuiltinSimulatorHost
	implements ISimulatorHost<BuiltinSimulatorProps>
{
	readonly project: IProject;

	readonly designer: IDesigner;

	readonly viewport = new Viewport();

	private _iframe?: HTMLIFrameElement;

	readonly asyncLibraryMap: { [key: string]: {} } = {};

	readonly libraryMap: { [key: string]: string } = {};

	_props: Ref<BuiltinSimulatorProps> = ref({});

	/**
	 * iframe内部的window对象
	 */
	private _contentWindow = ref<Window | null>(null);

	/**
	 * iframe内部的document对象
	 */
	private _contentDocument = ref<Document>();

	private sensing = false;

	get contentDocument() {
		return this._contentDocument.value;
	}

	private _sensorAvailable = true;

	get sensorAvailable(): boolean {
		return this._sensorAvailable;
	}

	constructor(project: Project, designer: Designer) {
		this.project = project;
		this.designer = designer;
	}

	contentWindow?: Window | undefined;

	private readonly computedTheme = computed(() => this.get('theme'));

	get theme() {
		return this.computedTheme.value;
	}

	/**
	 * 设置属性
	 * @param props
	 */
	setProps(props: BuiltinSimulatorProps) {
		this._props.value = props;
	}

	get(key: string) {
		return this._props.value[key];
	}

	async mountContentFrame(iframe: HTMLIFrameElement) {
		if (!iframe || this._iframe === iframe) {
			return;
		}
		this._iframe = iframe;

		this._contentWindow.value = iframe.contentWindow;
		this._contentDocument.value = this._contentWindow.value?.document;

		// 构建资源库
		const libraryAsset = this.buildLibrary();

		const vendors = [
			// vue环境
			assetBundle(defaultEnvironment, AssetLevel.Environment),
			// 额外的环境
			assetBundle(this.get('extraEnvironment'), AssetLevel.Environment),
			// 资产包定义的环境
			assetBundle(libraryAsset, AssetLevel.Library),
			// 主题
			assetBundle(this.theme, AssetLevel.Theme),
			// 渲染器模拟器环境 TODO 没有设置内置的模拟器环境
			assetBundle(this.get('simulatorUrl'), AssetLevel.Runtime),
		];

		const renderer: any = await createSimulator(this, iframe, vendors);
		// 内部实现是模拟vue挂载实例createApp(component).mount(#app);
		renderer.run();
	}

	mountViewport(viewport: HTMLElement | null) {
		this.viewport.mount(viewport);
	}

	/**
	 * 构建资源库
	 */
	buildLibrary(library?: LibraryItem[]) {
		// 获取库配置,如果没有传入则使用内部配置
		const _library = library || (this.get('library') as LibraryItem[]);
		// 初始化资源列表和导出列表
		const libraryAsset: AssetList = [];
		const libraryExportList: string[] = [];
		const functionCallLibraryExportList: string[] = [];

		if (_library && _library.length) {
			_library.forEach((item) => {
				// 记录包名和库名的映射关系
				this.libraryMap[item.package] = item.library;

				// 处理异步加载的库
				if (item.async) {
					this.asyncLibraryMap[item.package] = item;
				}

				// 处理导出名称和库名不一致的情况
				if (item.exportName && item.library) {
					libraryExportList.push(
						`Object.defineProperty(window,'${item.exportName}',{get:()=>window.${item.library}});`
					);
				}

				// 处理函数调用方式的导出
				if (item.exportMode === 'functionCall' && item.exportSourceLibrary) {
					functionCallLibraryExportList.push(
						`window["${item.library}"] = window["${item.exportSourceLibrary}"]("${item.library}", "${item.package}");`
					);
				}

				// 添加库的资源URL
				if (item.editUrls) {
					libraryAsset.push(item.editUrls);
				} else if (item.urls) {
					libraryAsset.push(item.urls);
				}
			});
		}

		// 合并所有资源配置
		libraryAsset.unshift(
			assetItem(AssetType.JSText, libraryExportList.join(''))
		);
		libraryAsset.push(
			assetItem(AssetType.JSText, functionCallLibraryExportList.join(''))
		);

		return libraryAsset;
	}

	watch(source: any, callback: any, options?: any) {
		watch(source, callback, options);
	}

	setSuspense() {
		return false;
	}

	isEnter(e: IPublicModelLocateEvent): boolean {
		const rect = this.viewport.bounds;
		return (
			e.globalY >= rect.top && // 点的Y坐标大于等于渲染区域模拟器矩形的顶部
			e.globalY <= rect.bottom && // 点的Y坐标小于等于渲染区域模拟器矩形的底部
			e.globalX >= rect.left && // 点的X坐标大于等于渲染区域模拟器矩形的左侧
			e.globalX <= rect.right // 点的X坐标小于等于渲染区域模拟器矩形的右侧
		);
	}

	deactiveSensor() {
		this.sensing = false;
		// TODO 滚动处理
	}

	fixEvent(e: ILocateEvent): ILocateEvent {
		// TODO 当从模拟器感应器和外部结构树感应器切换的时候，需要处理事件的坐标
		if (e.fixed) {
			return e;
		}
		e.fixed = true;
		return e;
	}

	locate(e: ILocateEvent) {
		// TODO 禁止移动的情况
		this.sensing = true;
		const document = this.project.currentDocument;
		if (!document) {
			return null;
		}
		const dropContainer = this.getDropContainer(e);

		return this.designer.createLocation({
			target: dropContainer.container,
		} as any) as any;
	}

	getDropContainer(e: ILocateEvent) {
		e;
		const document = this.project.currentDocument!;
		const { currentRoot } = document;

		return {
			container: currentRoot,
		};
	}
}
