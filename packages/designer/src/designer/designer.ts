import { IPublicTypeComponentMetadata } from '@arvin/microcode-types';
import { ref } from 'vue';
import { insertChildren } from '../document';
import { IProject, Project } from '../project';
import { Dragon, IDragon } from './dragon';
import { ComponentMeta, IComponentMeta } from '../component-meta';

export interface IDesigner {
	get dragon(): IDragon;
	readonly project: IProject;
	createComponentMeta(
		data: IPublicTypeComponentMetadata
	): IComponentMeta | null;
}
export class Designer implements IDesigner {
	// 拖拽实例
	dragon: IDragon;

	// 当前正在编排的项目实例
	readonly project: IProject;

	// 丢失的组件元数据映射表
	private _lostComponentMetasMap = new Map<string, ComponentMeta>();

	// 组件元数据映射表
	private _componentMetasMap = ref(new Map<string, IComponentMeta>());

	constructor() {
		this.dragon = new Dragon(this);
		this.project = new Project(this);

		this.dragon.onDragend(() => {
			// 插入
			insertChildren;
		});
	}

	/**
	 * 构建组件元数据映射表
	 * @param metas 组件元数据
	 */
	buildComponentMetasMap(metas: IPublicTypeComponentMetadata[]) {
		metas.forEach((meta) => {
			this.createComponentMeta(meta);
		});
	}

	/**
	 * 创建组件元数据
	 *
	 * @param data 组件元数据配置
	 * @returns 组件元数据实例,如果组件名为空则返回null
	 */
	createComponentMeta(
		data: IPublicTypeComponentMetadata
	): IComponentMeta | null {
		// 获取组件名作为key
		const key = data.componentName;
		if (!key) {
			return null;
		}
		// 从组件元数据映射表中查找是否已存在
		let meta = this._componentMetasMap.value.get(key);
		if (meta) {
			// 如果存在则更新元数据
			meta.setMetadata(data);
			this._componentMetasMap.value.set(key, meta);
		} else {
			// 从丢失的组件元数据映射表中查找
			meta = this._lostComponentMetasMap.get(key);
			if (meta) {
				// 如果在丢失表中找到则更新元数据并从丢失表中删除
				meta.setMetadata(data);
				this._lostComponentMetasMap.delete(key);
			} else {
				// 如果都没有找到则创建新的组件元数据
				meta = new ComponentMeta(this, data);
			}
			// 将元数据添加到映射表中
			this._componentMetasMap.value.set(key, meta);
		}

		return meta;
	}
}
