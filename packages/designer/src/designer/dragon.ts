import {
	IPublicModelDragObject,
	IPublicModelDragon,
} from '@arvin/microcode-types';
import { IDesigner } from './designer';

export interface IDragon extends IPublicModelDragon {}

export class Dragon implements IDragon {
	constructor(readonly designer: IDesigner) {
		designer;
	}

	/**
	 * 快速监听shell（容器元素）拖动行为
	 *
	 * @param shell 容器元素
	 * @param boost 拖拽的对象
	 * @returns
	 */
	from(
		shell: Element,
		boost: (e: MouseEvent) => IPublicModelDragObject | null
	) {
		const mousedown = (e: MouseEvent) => {
			// ESC or RightClick
			if (e.which === 3 || e.button === 2) {
				return;
			}
			const dragObject = boost(e);
			if (!dragObject) {
				return;
			}
			this.boost(dragObject, e);
		};
		shell.addEventListener('mousedown', mousedown as any);
		return () => {
			shell.removeEventListener('mousedown', mousedown as any);
		};
	}

	/**
	 * 发射拖拽对象
	 *
	 * @param dragObject 拖拽对象
	 * @param e 拖拽初始时事件
	 */
	boost(dragObject: IPublicModelDragObject, e: MouseEvent | DragEvent) {
		console.log(dragObject, e);
	}
}
