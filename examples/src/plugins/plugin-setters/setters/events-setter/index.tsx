import {
	computed,
	defineComponent,
	nextTick,
	onBeforeUnmount,
	onMounted,
	PropType,
	ref,
	toRaw,
} from 'vue';
import './index.scss';
import { Button, Dropdown, Menu } from 'ant-design-vue';
import { event, project, skeleton } from '@arvin-shu/microcode-engine';
import { EditIcon } from './icons/edit';
import { DeleteIcon } from './icons/delete';

const SETTER_NAME = 'event-setter';

const EVENT_CONTENTS = {
	// 组件事件
	COMPONENT_EVENT: 'componentEvent',
	// 原生事件
	NATIVE_EVENT: 'nativeEvent',
	// 生命周期事件
	LIFE_CYCLE_EVENT: 'lifeCycleEvent',
};

// 定义事件类型
const DEFINITION_EVENT_TYPE = {
	// 组件事件
	EVENTS: 'events',
	// 原生事件
	NATIVE_EVENTS: 'nativeEvents',
	// 生命周期事件
	LIFE_CYCLE_EVENT: 'lifeCycleEvent',
};

export const EventsSetter = defineComponent({
	name: 'EventsSetter',
	inheritAttrs: false,
	emits: ['change'],
	props: {
		value: {
			type: Object as PropType<any>,
		},
		definition: {
			type: Array as PropType<any[]>,
			required: true,
		},
	},
	setup(props, { emit }) {
		const eventBtn = ref<{ value: string; label: string }>();

		const eventList = ref<any[]>([]);

		const nativeEventList = ref<any[]>([]);

		const lifeCycleEventList = ref<any[]>([]);

		const eventDataList = ref<any[]>(
			// @ts-ignore
			(props?.value?.eventDataList
				? // @ts-ignore
					props.value.eventDataList
				: props?.value) || []
		);

		const initLifeCycleEventDataList = (isRoot: boolean) => {
			if (isRoot && !props.value) {
				const schema = project.exportSchema();
				const lifeCycles = schema.componentsTree[0].lifeCycles;
				if (lifeCycles) {
					for (const key in lifeCycles) {
						eventDataList.value.push({
							name: key,
							relatedEventName: key,
							type: EVENT_CONTENTS.LIFE_CYCLE_EVENT,
						});
					}
				}
			}
		};

		const initEventBtns = async () => {
			const { definition } = props;
			let isRoot = false;
			let isCustom = false;
			definition.map((item) => {
				// 生命周期事件
				if (item.type === DEFINITION_EVENT_TYPE.LIFE_CYCLE_EVENT) {
					isRoot = true;
				}

				// 组件事件
				if (item.type === DEFINITION_EVENT_TYPE.EVENTS) {
					isCustom = true;
				}

				return item;
			});

			if (isRoot) {
				eventBtn.value = {
					value: EVENT_CONTENTS.LIFE_CYCLE_EVENT,
					label: '生命周期',
				};
			} else if (isCustom) {
				eventBtn.value = {
					value: EVENT_CONTENTS.COMPONENT_EVENT,
					label: '组件自带事件',
				};
			} else {
				eventBtn.value = {
					value: EVENT_CONTENTS.NATIVE_EVENT,
					label: '原生事件',
				};
			}
			await nextTick();
			initLifeCycleEventDataList(isRoot);
		};
		initEventBtns();

		const checkEventListStatus = (list: any[], eventType: string) => {
			if (
				eventType === DEFINITION_EVENT_TYPE.EVENTS ||
				eventType === DEFINITION_EVENT_TYPE.LIFE_CYCLE_EVENT
			) {
				eventList.value.map((item) => {
					item.disabled = false;
					eventDataList.value.map((eventDataItem) => {
						if (item.name === eventDataItem.name) {
							item.disabled = true;
						}

						return eventDataItem;
					});

					return item;
				});
			} else if (eventType === DEFINITION_EVENT_TYPE.NATIVE_EVENTS) {
				eventDataList.value.map((eventDataItem) => {
					eventList.value.map((item: any) => {
						item.eventList.map((eventItem: any) => {
							if (eventItem.name === eventDataItem.name) {
								item.disabled = true;
							} else {
								item.disabled = false;
							}
							return eventItem;
						});
						return item;
					});

					return eventDataItem;
				});
			}
		};

		const updateEventListStatus = (eventName: string, unDisabled?: boolean) => {
			eventList.value.map((item) => {
				if (item.name === eventName) {
					item.disabled = !unDisabled;
				}
				return item;
			});

			lifeCycleEventList.value.map((item) => {
				if (item.name === eventName) {
					item.disabled = !unDisabled;
				}
				return item;
			});

			nativeEventList.value.map((item) => {
				item.eventList.map((itemData: any) => {
					if (itemData.name === eventName) {
						itemData.disabled = !unDisabled;
					}
					return itemData;
				});

				return item;
			});
		};

		const initEventList = () => {
			const { definition } = props;

			definition.forEach((item) => {
				if (item.type === DEFINITION_EVENT_TYPE.EVENTS) {
					checkEventListStatus(item.list, DEFINITION_EVENT_TYPE.EVENTS);
					eventList.value = [...item.list];
				}
				if (item.type === DEFINITION_EVENT_TYPE.NATIVE_EVENTS) {
					checkEventListStatus(item.list, DEFINITION_EVENT_TYPE.NATIVE_EVENTS);
					nativeEventList.value = [...item.list];
				}
				if (item.type === DEFINITION_EVENT_TYPE.LIFE_CYCLE_EVENT) {
					checkEventListStatus(
						item.list,
						DEFINITION_EVENT_TYPE.LIFE_CYCLE_EVENT
					);
					lifeCycleEventList.value = [...item.list];
				}
			});

			if (nativeEventList.value.length === 0) {
				nativeEventList.value = NATIVE_EVENT_LIST;
			}
		};
		initEventList();

		const showEventList = computed(() =>
			lifeCycleEventList.value.length > 0
				? lifeCycleEventList.value
				: eventList.value
		);

		const onEventMenuClick = (e: any, type: string) => {
			const name = e.keyPath[0];
			eventDataList.value.push({
				type,
				name,
			});
			updateEventListStatus(name);
			openEventBindModal(name, name, false);
		};

		const openEventBindModal = (
			relatedEventName: string,
			eventName: String,
			isEdit: boolean
		) => {
			let paramStr;
			let configEventData; // 配置的event信息
			eventDataList.value.map((item) => {
				if (item.name === eventName) {
					paramStr = item.paramStr;
				}
				return item;
			});
			eventList.value.map((item) => {
				if (item.name === eventName) {
					configEventData = item;
				}
				return item;
			});

			event.emit(
				'eventBindModal.openModal',
				relatedEventName,
				SETTER_NAME,
				paramStr,
				isEdit,
				eventName,
				configEventData
			);
		};

		const renderMenu = () => {
			const type = eventBtn.value?.value;

			if (!type) {
				return null;
			}

			if (type !== EVENT_CONTENTS.NATIVE_EVENT) {
				return (
					<Menu
						onClick={(event: any) => {
							onEventMenuClick(event, type);
						}}
						class="mtc-block-setter-event-menu"
					>
						{showEventList.value.map((item) => (
							<Menu.Item disabled={item.disabled} key={item.name}>
								{item.name}
							</Menu.Item>
						))}
					</Menu>
				);
			}
			if (type === EVENT_CONTENTS.NATIVE_EVENT) {
				return (
					<Menu
						onClick={(event: any) => {
							onEventMenuClick(event, type);
						}}
						class="mtc-block-setter-event-menu"
					>
						{nativeEventList.value.map((item, index) => (
							<Menu.ItemGroup key={index} title={item.name}>
								{item.eventList.map((groupItem: any) => (
									<Menu.Item disabled={groupItem.disabled} key={groupItem.name}>
										{groupItem.name}
									</Menu.Item>
								))}
							</Menu.ItemGroup>
						))}
					</Menu>
				);
			}
		};

		const bindEvent = (
			relatedEventName: string,
			paramStr: string,
			bindEventName: String
		) => {
			eventDataList.value.map((item) => {
				if (item.name === bindEventName) {
					item.relatedEventName = toRaw(relatedEventName);
					item.paramStr = toRaw(paramStr);
				}
				return item;
			});

			emit('change', {
				eventDataList: toRaw(eventDataList.value),
				eventList: toRaw(eventList.value),
			});
		};

		onMounted(() => {
			event.on(`common:${SETTER_NAME}.bindEvent`, bindEvent);
		});

		onBeforeUnmount(() => {
			event.off(`common:${SETTER_NAME}.bindEvent`, bindEvent);
		});

		const onDeleteEvent = (eventName: string) => {
			eventDataList.value = eventDataList.value.filter(
				(item) => item.name !== eventName
			);
			emit('change', {
				eventDataList: toRaw(eventDataList.value),
				eventList: toRaw(eventList.value),
			});
			updateEventListStatus(eventName, true);
		};

		const onRelatedEventNameClick = (relatedEventName: string) => {
			// props 事件，不需要跳转
			if (/(this\.)?props\./.test(relatedEventName)) {
				return;
			}
			skeleton.showPanel('codeEditor');
			setTimeout(() => {
				event.emit('codeEditor.focusByFunction', {
					functionName: relatedEventName,
				});
			});
		};
		return () => (
			<div className="mtc-block-setter event-body">
				<Dropdown trigger="click" overlay={renderMenu()}>
					<Button style={{ width: '100%' }}>{eventBtn.value?.label}</Button>
				</Dropdown>

				<div class="mtc-block-setter-event-list">
					{eventDataList.value.map((item) => (
						<div class="mtc-block-setter-event-list-item" key={item.name}>
							<div class="item-header">
								<span class="event-name">{item.name}</span>
								<div class="action-buttons">
									<EditIcon
										onClick={() =>
											openEventBindModal(item.relatedEventName, item.name, true)
										}
										class="anticon"
									/>
									<DeleteIcon
										onClick={() => onDeleteEvent(item.name)}
										class="anticon"
									/>
								</div>
							</div>
							{item.relatedEventName && (
								<div class="event-function">
									<span class="function-name">function</span>
									<span
										class="params"
										onClick={() =>
											onRelatedEventNameClick(item.relatedEventName)
										}
									>
										{item.relatedEventName}
									</span>
									<span class="parentheses">()</span>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		);
	},
});

export const NATIVE_EVENT_LIST = [
	{
		category: 'commonlyEvent',
		name: '常用事件',
		eventList: [
			{ name: 'onClick' },
			{ name: 'onChange' },
			{ name: 'onInput' },
			{ name: 'onSelect' },
			{ name: 'onSubmit' },
			{ name: 'onReset' },
			{ name: 'onFocus' },
			{ name: 'onBlur' },
			{ name: 'onScroll' },
			{ name: 'onLoad' },
			{ name: 'onError' },
		],
	},
	{
		category: 'keybordEvent',
		name: '键盘事件',
		eventList: [
			{ name: 'onKeyDown' },
			{ name: 'onKeyPress' },
			{ name: 'onKeyUp' },
		],
	},
	{
		category: 'mouseEvent',
		name: '鼠标事件',
		eventList: [
			{ name: 'onDoubleClick' },
			{ name: 'onDrag' },
			{ name: 'onDragEnd' },
			{ name: 'onDragEnter' },
			{ name: 'onDragExit' },
			{ name: 'onDragLeave' },
			{ name: 'onDragOver' },
			{ name: 'onDragStart' },
			{ name: 'onDrop' },
			{ name: 'onMouseDown' },
			{ name: 'onMouseEnter' },
			{ name: 'onMouseLeave' },
			{ name: 'onMouseMove' },
			{ name: 'onMouseOut' },
			{ name: 'onMouseOver' },
			{ name: 'onMouseUp' },
		],
	},
	{
		category: 'animateEvent',
		name: '动画事件',
		eventList: [
			{ name: 'onAnimationStart' },
			{ name: 'onAnimationEnd' },
			{ name: 'onAnimationItration' },
			{ name: 'onTransitionEnd' },
		],
	},
];
