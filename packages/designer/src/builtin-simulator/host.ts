import { ExtractPropTypes, PropType, Ref, ref } from 'vue';
import {
	Asset,
	AssetLevel,
	AssetList,
	AssetType,
	IPublicTypePackage,
} from '@arvin-shu/microcode-types';
import { assetBundle, assetItem } from '@arvin-shu/microcode-utils';
import { Designer, IDesigner } from '../designer';
import { IProject, Project } from '../project';
import { ISimulatorHost } from '../simulator';
import { createSimulator } from './create-simulator';

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

	private _iframe?: HTMLIFrameElement;

	_props: Ref<BuiltinSimulatorProps> = ref({});

	/**
	 * iframe内部的window对象
	 */
	private _contentWindow = ref<Window | null>(null);

	/**
	 * iframe内部的document对象
	 */
	private _contentDocument = ref<Document>();

	constructor(project: Project, designer: Designer) {
		this.project = project;
		this.designer = designer;
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
			null,
			// 资产包定义的环境
			assetBundle(libraryAsset, AssetLevel.Library),
			// 主题
			null,
			// 渲染器模拟器环境
			assetBundle(this.get('simulatorUrl'), AssetLevel.Runtime),
		];

		const renderer: any = await createSimulator(this, iframe, vendors);
		// 内部实现是模拟vue挂载实例createApp(component).mount(#app);
		renderer.run();
	}

	/**
	 * 构建资源库
	 */
	buildLibrary() {
		const _library = this.get('library') as LibraryItem[];
		const libraryAsset: AssetList = [];

		if (_library && _library.length) {
			_library.forEach((item) => {
				if (item.urls) {
					libraryAsset.push(item.urls);
				}
			});
		}
		return libraryAsset;
	}
}
