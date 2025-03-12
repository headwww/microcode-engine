import { IPublicTypeCompositeValue } from './composite-value';
import { IPublicTypeNodeData } from './node-data';
import { IPublicTypePropsMap } from './props-map';

/**
*  搭建基础协议 - 单个组件树节点描述
 * 以下是基于 IPublicTypeNodeSchema 的 Vue 3 渲染逻辑简化示例：

      *  vue
      *  复制代码
      *  <script setup>
      *  import { defineComponent, h, resolveComponent } from 'vue';

      *  function renderNode(schema) {
        const Component = resolveComponent(schema.componentName);
        if (!Component) return null;

        const children = Array.isArray(schema.children)
            ? schema.children.map((child) => renderNode(child))
            : renderNode(schema.children);

        return h(
            Component,
            {
            ...schema.props,
            vIf: schema.condition, // Vue 内部处理条件
            },
            children
        );
        }

        // 使用示例
        const rootNode = {
        componentName: 'MyComponent',
        props: { message: 'Hello World' },
        children: [
            {
            componentName: 'ChildComponent',
            props: { count: 5 },
            },
        ],
        };
        </script>

        <template>
        <div>
            <!-- 渲染节点 -->
            {{ renderNode(rootNode) }}
        </div>
        </template>
        这样，IPublicTypeNodeSchema 可以很好地被应用到 Vue 3 中实现动态组件渲染。
 */
export interface IPublicTypeNodeSchema {
	id?: string;

	/**
	 * 组件名称 必填、首字母大写
	 */
	componentName: string;

	/**
	 * 组件属性对象
	 */
	props?: {
		children?: IPublicTypeNodeData | IPublicTypeNodeData[];
	} & IPublicTypePropsMap;

	/**
	 * 渲染条件
	 */
	condition?: IPublicTypeCompositeValue;

	/**
	 * 循环数据
	 */
	loop?: IPublicTypeCompositeValue;

	/**
	 * 循环迭代对象、索引名称 ["item", "index"]
	 */
	loopArgs?: [string, string];

	/**
	 * 子节点
	 */
	children?: IPublicTypeNodeData | IPublicTypeNodeData[];

	/**
	 * 是否锁定
	 */
	isLocked?: boolean;

	// ------- future support -----
	/**
	 * 条件组,用于将多个条件组合在一起
	 */
	conditionGroup?: string;

	/**
	 * 节点标题,用于在设计器中显示
	 */
	title?: string;

	/**
	 * 是否忽略该节点的渲染
	 */
	ignore?: boolean;

	/**
	 * 是否锁定节点,锁定后无法编辑
	 */
	locked?: boolean;

	/**
	 * 是否在设计模式下隐藏该节点
	 */
	hidden?: boolean;

	/**
	 * 是否固定在顶部
	 */
	isTopFixed?: boolean;

	/** @experimental 编辑态内部使用 */
	__ctx?: any;
}
