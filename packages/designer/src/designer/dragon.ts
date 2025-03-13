import {
	IPublicEnumDragObjectType,
	IPublicModelDragObject,
	IPublicModelDragon,
	IPublicModelLocateEvent,
	IPublicModelNode,
	IPublicModelSensor,
	IPublicTypeDragNodeDataObject,
} from '@arvin-shu/microcode-types';
import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import { ref } from 'vue';
import { cursor, setNativeSelection } from '@arvin-shu/microcode-utils';
import { IDesigner } from './designer';
import { makeEventsHandler } from '../utils';
import { isShaken } from './utils';
import { ISimulatorHost, isSimulatorHost } from '../simulator';
import { INode, Node } from '../document';

export function isInvalidPoint(e: any, last: any): boolean {
	return (
		e.clientX === 0 &&
		e.clientY === 0 &&
		last &&
		(Math.abs(last.clientX - e.clientX) > 5 ||
			Math.abs(last.clientY - e.clientY) > 5)
	);
}

export function isSameAs(
	e1: MouseEvent | DragEvent,
	e2: MouseEvent | DragEvent
): boolean {
	return e1.clientY === e2.clientY && e1.clientX === e2.clientX;
}

export interface ILocateEvent extends IPublicModelLocateEvent {
	readonly type: 'LocateEvent';

	sensor?: IPublicModelSensor;
}

/**
 * 判断事件是否为拖拽事件
 * 拖拽事件是由浏览器原生的drag & drop API触发的事件
 * 包括:
 * - dragstart: 开始拖拽时触发
 * - drag: 拖拽过程中持续触发
 * - dragenter: 拖拽进入目标元素时触发
 * - dragover: 拖拽经过目标元素时触发
 * - dragleave: 拖拽离开目标元素时触发
 * - drop: 在目标元素上松开鼠标时触发
 * - dragend: 拖拽结束时触发
 * @param e 事件对象
 * @returns 如果是拖拽事件返回 true,否则返回 false
 */
function isDragEvent(e: any): e is DragEvent {
	return e?.type?.startsWith('drag');
}

/**
 * 设置事件为已抖动状态
 * 用于标记鼠标移动是否已经达到触发拖拽的条件
 * @param e 事件对象
 */
export function setShaken(e: any) {
	e.shaken = true;
}

// 判断是否为拖拽节点对象
export function isDragNodeObject(
	obj: any
): obj is IPublicTypeDragNodeDataObject {
	return obj && obj.type === IPublicEnumDragObjectType.Node;
}

// 获取拖拽对象的源传感器
function getSourceSensor(
	dragObject: IPublicModelDragObject
): ISimulatorHost | null {
	if (!isDragNodeObject(dragObject)) {
		return null;
	}
	return (dragObject.nodes?.[0]?.document as any)?.simulator || null;
}

export interface IDragon extends IPublicModelDragon<INode, ILocateEvent> {
	emitter: IEventBus;
}

export class Dragon implements IDragon {
	private sensors: IPublicModelSensor[] = [];

	private nodeInstPointerEvents: boolean;

	key = Math.random();

	private _activeSensor = ref<IPublicModelSensor | undefined>();

	get activeSensor() {
		return this._activeSensor.value;
	}

	private _dragging = ref(false);

	get dragging(): boolean {
		return this._dragging.value;
	}

	private _canDrop = ref(false);

	get canDrop(): boolean {
		return this._canDrop.value;
	}

	viewName: string | undefined;

	emitter: IEventBus = createModuleEventBus('Dragon');

	constructor(readonly designer: IDesigner) {
		this.viewName = designer.viewName;
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
	 * @param boostEvent 拖拽初始时事件
	 */
	boost(
		dragObject: IPublicModelDragObject,
		boostEvent: MouseEvent | DragEvent,
		fromRglNode?: INode | IPublicModelNode
	) {
		const { designer } = this;
		const masterSensors = this.getMasterSensors();

		const handleEvents = makeEventsHandler(boostEvent, masterSensors);

		// 是否是新的node对象而不是模拟器中已经有的node对象
		const newBie = !isDragNodeObject(dragObject);
		const hasSlotNode = dragObject.nodes?.some(
			(node: Node | IPublicModelNode | null) =>
				typeof node?.isSlot === 'function' ? node.isSlot() : node?.isSlot
		);
		const forceCopyState = isDragNodeObject(dragObject) && hasSlotNode;

		// 判断是否为拖拽API事件
		const isBoostFromDragAPI = isDragEvent(boostEvent);

		// 上一次的拖拽感应区
		let lastSensor: IPublicModelSensor | undefined;

		this._dragging.value = false;

		const getRGL = (e: MouseEvent | DragEvent) => {
			const locateEvent = createLocateEvent(e);
			const sensor = chooseSensor(locateEvent);
			if (!sensor || !sensor.getNodeInstanceFromElement) return {};
			const nodeInst = sensor.getNodeInstanceFromElement(e.target as Element);
			return nodeInst?.node?.getRGL() || {};
		};

		const checkesc = (e: KeyboardEvent) => {
			// 如果按下ESC键，则清除拖拽位置，并调用over函数
			if (e.keyCode === 27) {
				designer.clearLocation();
				over();
			}
		};

		let copy = false;
		const checkcopy = (e: any) => {
			if (isDragEvent(e) && e.dataTransfer) {
				if (newBie || forceCopyState) {
					e.dataTransfer.dropEffect = 'copy';
				}
				return;
			}
			if (newBie) {
				return;
			}

			if (e.altKey || e.ctrlKey) {
				copy = true;
				this.setCopyState(true);
				if (isDragEvent(e) && e.dataTransfer) {
					e.dataTransfer.dropEffect = 'copy';
				}
			} else {
				copy = false;
				if (!forceCopyState) {
					this.setCopyState(false);
					if (isDragEvent(e) && e.dataTransfer) {
						e.dataTransfer.dropEffect = 'move';
					}
				}
			}
		};

		let lastArrive: any;

		const drag = (e: MouseEvent | DragEvent) => {
			checkcopy(e);

			if (isInvalidPoint(e, lastArrive)) return;

			if (lastArrive && isSameAs(e, lastArrive)) {
				lastArrive = e;
				return;
			}
			lastArrive = e;
			const { isRGL, rglNode } = getRGL(e) as any;
			const locateEvent = createLocateEvent(e);
			const sensor = chooseSensor(locateEvent);

			if (isRGL) {
				// 禁止被拖拽元素的阻断
				const nodeInst = dragObject.nodes?.[0]?.getDOMNode();
				if (nodeInst && nodeInst.style) {
					this.nodeInstPointerEvents = true;
					nodeInst.style.pointerEvents = 'none';
				}
				// 原生拖拽
				this.emitter.emit('rgl.sleeping', false);
				if (fromRglNode && fromRglNode.id === rglNode.id) {
					designer.clearLocation();
					this.clearState();
					this.emitter.emit('drag', locateEvent);
					return;
				}
				this._canDrop.value = !!sensor?.locate(locateEvent);
				if (this._canDrop) {
					this.emitter.emit('rgl.add.placeholder', {
						rglNode,
						fromRglNode,
						node: locateEvent.dragObject?.nodes?.[0],
						event: e,
					});
					designer.clearLocation();
					this.clearState();
					this.emitter.emit('drag', locateEvent);
					return;
				}
			} else {
				this._canDrop.value = false;
				this.emitter.emit('rgl.remove.placeholder');
				this.emitter.emit('rgl.sleeping', true);
			}

			if (sensor) {
				sensor.fixEvent(locateEvent);
				sensor?.locate(locateEvent);
			} else {
				// 清除插入的位置
				designer.clearLocation();
			}

			this.emitter.emit('drag', locateEvent);
		};

		const dragstart = () => {
			this._dragging.value = true;
			setShaken(boostEvent);
			const locateEvent = createLocateEvent(boostEvent);
			if (newBie || forceCopyState) {
				this.setCopyState(true);
			} else {
				chooseSensor(locateEvent);
			}
			this.setDraggingState(true);

			if (!isBoostFromDragAPI) {
				handleEvents((doc) => {
					doc.addEventListener('keydown', checkesc, false);
				});
			}

			this.emitter.emit('dragstart', locateEvent);
		};

		const move = (e: MouseEvent | DragEvent) => {
			// 检查是否为拖拽API事件
			if (isBoostFromDragAPI) {
				// 阻止默认行为
				e.preventDefault();
			}
			if (this._dragging.value) {
				drag(e);
				return;
			}

			// 检查鼠标是否有足够的移动距离来触发拖拽
			if (isShaken(boostEvent, e)) {
				// 触发拖拽开始事件
				dragstart();
				// 执行拖拽操作
				drag(e);
			}
		};

		let didDrop = true;
		const drop = (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			didDrop = true;
		};

		const over = (e?: any) => {
			if (this.nodeInstPointerEvents) {
				const nodeInst = dragObject.nodes?.[0]?.getDOMNode();
				if (nodeInst && nodeInst.style) {
					nodeInst.style.pointerEvents = '';
				}
				this.nodeInstPointerEvents = false;
			}

			// 发送drop事件
			if (e) {
				const { isRGL, rglNode } = getRGL(e) as any;
				if (isRGL && this._canDrop && this._dragging) {
					const tarNode = dragObject.nodes?.[0];
					if (rglNode.id !== tarNode?.id) {
						// 避免死循环
						this.emitter.emit('rgl.drop', {
							rglNode,
							node: tarNode,
						});
						const selection = designer.project.currentDocument?.selection;
						selection?.select(tarNode?.id!);
					}
				}
			}

			// 移除磁帖占位消息
			this.emitter.emit('rgl.remove.placeholder');

			if (e && isDragEvent(e)) {
				e.preventDefault();
			}
			if (lastSensor) {
				lastSensor.deactiveSensor();
			}
			if (isBoostFromDragAPI) {
				if (!didDrop) {
					designer.clearLocation();
				}
			} else {
				this.setNativeSelection(true);
			}
			this.clearState();

			let exception;
			if (this._dragging) {
				this._dragging.value = false;
				try {
					this.emitter.emit('dragend', { dragObject, copy });
				} catch (ex) {
					exception = ex;
				}
			}
			designer.clearLocation();
			handleEvents((doc) => {
				/* istanbul ignore next */
				if (isBoostFromDragAPI) {
					doc.removeEventListener('dragover', move, true);
					doc.removeEventListener('dragend', over, true);
					doc.removeEventListener('drop', drop, true);
				} else {
					doc.removeEventListener('mousemove', move, true);
					doc.removeEventListener('mouseup', over, true);
				}
				doc.removeEventListener('mousedown', over, true);
				doc.removeEventListener('keydown', checkesc, false);
				doc.removeEventListener('keydown', checkcopy, false);
				doc.removeEventListener('keyup', checkcopy, false);
			});
			if (exception) {
				throw exception;
			}
		};

		// 用于创建拖拽定位事件
		const createLocateEvent = (e: MouseEvent | DragEvent): ILocateEvent => {
			const evt: any = {
				type: 'LocateEvent',
				// 拖拽对象
				dragObject,
				// 被拖拽的元素
				target: e.target,
				// 原始事件
				originalEvent: e,
			};

			const sourceDocument = e.view?.document;

			// 如果没有源document或鼠标当前指向的是源document的对象则直接使用事件的clientX/Y作为全局坐标
			if (!sourceDocument || sourceDocument === document) {
				evt.globalX = e.clientX;
				evt.globalY = e.clientY;
			} else {
				let srcSim: ISimulatorHost | undefined;
				// 获取上一个传感器,如果是模拟器类型则赋值,否则为null
				const lastSim =
					lastSensor && isSimulatorHost(lastSensor) ? lastSensor : null;
				// 如果上一个模拟器存在且其document与源document相同,则使用上一个模拟器
				if (lastSim && lastSim.contentDocument === sourceDocument) {
					srcSim = lastSim;
				} else {
					// 从主传感器列表中查找document与源document匹配的模拟器
					srcSim = masterSensors.find(
						(sim) => sim.contentDocument === sourceDocument
					);
					// 如果没找到匹配的模拟器但存在上一个模拟器,则使用上一个模拟器
					if (!srcSim && lastSim) {
						srcSim = lastSim;
					}
				}

				// 如果存在源模拟器
				if (srcSim) {
					// 将事件坐标从模拟器视口坐标系转换为全局坐标系
					const g = srcSim.viewport.toGlobalPoint(e);
					evt.globalX = g.clientX;
					evt.globalY = g.clientY;
					// 保存原始的画布坐标
					evt.canvasX = e.clientX;
					evt.canvasY = e.clientY;
					// 设置事件的传感器为源模拟器
					evt.sensor = srcSim;
				} else {
					// 如果不存在源模拟器,直接使用原始事件坐标
					evt.globalX = e.clientX;
					evt.globalY = e.clientY;
				}
			}
			return evt;
		};

		const sourceSensor = getSourceSensor(dragObject);

		// 选择传感器
		const chooseSensor = (e: ILocateEvent) => {
			const sensors: IPublicModelSensor[] = this.sensors.concat(masterSensors);

			// 确定当前使用的传感器:
			// 1. 如果事件已经有绑定的传感器(e.sensor)且鼠标在该传感器区域内(isEnter),则使用该传感器
			// 2. 否则从所有传感器中找到第一个可用的(sensorAvailable)且鼠标在其区域内(isEnter)的传感器
			let sensor =
				e.sensor && e.sensor.isEnter(e)
					? e.sensor
					: sensors.find((s) => s.sensorAvailable && s.isEnter(e));
			// 如果传感器不存在,则从以下几种情况中选择:
			if (!sensor) {
				// 1. 上一次使用的传感器(lastSensor)
				if (lastSensor) {
					sensor = lastSensor;
				} else if (e.sensor) {
					// 2. 事件中已绑定的传感器(e.sensor)
					sensor = e.sensor;
				} else if (sourceSensor) {
					// 3. 拖拽对象的源传感器(sourceSensor)
					sensor = sourceSensor;
				}
			}

			if (sensor !== lastSensor) {
				if (lastSensor) {
					lastSensor.deactiveSensor();
				}
				lastSensor = sensor;
			}

			if (sensor) {
				e.sensor = sensor;
				sensor.fixEvent(e);
			}
			this._activeSensor.value = sensor;
			return sensor;
		};

		if (isDragEvent(boostEvent)) {
			const { dataTransfer } = boostEvent;

			if (dataTransfer) {
				dataTransfer.effectAllowed = 'all';

				try {
					dataTransfer.setData('application/json', '{}');
				} catch (ex) {
					// eslint-disable-next-line no-console
					console.error(ex);
				}
			}

			dragstart();
		} else {
			this.setNativeSelection(false);
		}

		handleEvents((doc) => {
			if (isBoostFromDragAPI) {
				doc.addEventListener('dragover', move, true);
				didDrop = false;
				doc.addEventListener('drop', drop, true);
				doc.addEventListener('dragend', over, true);
			} else {
				// 鼠标移动
				doc.addEventListener('mousemove', move, true);
				// 鼠标松开
				doc.addEventListener('mouseup', over, true);
			}

			// 鼠标按下
			doc.addEventListener('mousedown', over, true);
		});

		if (!newBie && !isBoostFromDragAPI) {
			handleEvents((doc) => {
				doc.addEventListener('keydown', checkcopy, false);
				doc.addEventListener('keyup', checkcopy, false);
			});
		}
	}

	private getMasterSensors(): ISimulatorHost[] {
		return Array.from(
			new Set(
				this.designer.project.documents
					.map((doc) => {
						if (doc.active && doc.simulator?.sensorAvailable) {
							return doc.simulator;
						}
						return null;
					})
					.filter(Boolean) as any
			)
		);
	}

	private getSimulators() {
		return new Set(this.designer.project.documents.map((doc) => doc.simulator));
	}

	private setNativeSelection(enableFlag: boolean) {
		setNativeSelection(enableFlag);
		this.getSimulators().forEach((sim) => {
			sim?.setNativeSelection(enableFlag);
		});
	}

	/**
	 * 设置拖拽态
	 */
	private setDraggingState(state: boolean) {
		cursor.setDragging(state);
		this.getSimulators().forEach((sim) => {
			sim?.setDraggingState(state);
		});
	}

	/**
	 * 设置拷贝态
	 */
	private setCopyState(state: boolean) {
		cursor.setCopy(state);
		this.getSimulators().forEach((sim) => {
			sim?.setCopyState(state);
		});
	}

	/**
	 * 清除所有态：拖拽态、拷贝态
	 */
	private clearState() {
		cursor.release();
		this.getSimulators().forEach((sim) => {
			sim?.clearState();
		});
	}

	/**
	 * 添加投放感应区
	 */
	addSensor(sensor: any) {
		this.sensors.push(sensor);
	}

	/**
	 * 移除投放感应
	 */
	removeSensor(sensor: any) {
		const i = this.sensors.indexOf(sensor);
		if (i > -1) {
			this.sensors.splice(i, 1);
		}
	}

	/**
	 * 绑定拖拽开始事件
	 * @param func
	 * @returns
	 */
	onDragstart(func: (e: ILocateEvent) => any) {
		this.emitter.on('dragstart', func);
		return () => {
			this.emitter.removeListener('dragstart', func);
		};
	}

	/**
	 * 绑定拖拽事件
	 * @param func
	 * @returns
	 */
	onDrag(func: (e: ILocateEvent) => any) {
		this.emitter.on('drag', func);
		return () => {
			this.emitter.removeListener('drag', func);
		};
	}

	/**
	 * 绑定拖拽结束事件
	 * @param func
	 * @returns
	 */
	onDragend(
		func: (x: { dragObject: IPublicModelDragObject; copy: boolean }) => any
	) {
		this.emitter.on('dragend', func);
		return () => {
			this.emitter.removeListener('dragend', func);
		};
	}
}
