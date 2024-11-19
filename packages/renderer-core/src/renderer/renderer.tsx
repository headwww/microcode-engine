/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2024-11-14 16:35:30
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2024-11-19 09:24:49
 * @FilePath: /microcode-engine/packages/renderer-core/src/renderer/renderer.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { IPublicTypeContainerSchema } from '@arvin-shu/microcode-types';
import { Component, defineComponent, PropType } from 'vue';

export const Renderer = defineComponent({
	name: 'Renderer',
	props: {
		schema: {
			type: Object as PropType<IPublicTypeContainerSchema>,
			required: true,
		},
		components: {
			type: Object as PropType<Record<string, Component>>,
			required: true,
		},
	},
	setup(props) {
		return () => {
			const { schema, components } = props;

			const renderNode = (node: IPublicTypeContainerSchema) => {
				const Comp: any = components[node.componentName];

				return <Comp {...node.props} />;
			};

			renderNode;
			schema;
			return <div>{renderNode(schema)}</div>;
		};
	},
});
