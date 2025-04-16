import { defineComponent, ref, watch, Suspense } from 'vue';
import { Button, Drawer } from 'ant-design-vue';
import MicrocodeRenderer from '@arvin-shu/microcode-renderer-core';
import { IPublicEnumTransformStage } from '@arvin-shu/microcode-types';
import { material, project } from '@arvin-shu/microcode-engine';
import { AssetLoader, buildComponents } from '@arvin-shu/microcode-utils';
import { createAxiosFetchHandler } from '../fetch';

export const Preview = defineComponent({
	name: 'Preview',
	setup() {
		const open = ref(false);
		const components = ref<any>();

		watch(open, async () => {
			if (open.value) {
				await init();
			}
		});

		const schema = ref<any>(null);

		async function init() {
			schema.value = project.exportSchema(
				IPublicEnumTransformStage.Render
			).componentsTree[0];
			const componentsMapArray = project.exportSchema(
				IPublicEnumTransformStage.Render
			).componentsMap;

			const componentsMap: any = {};

			componentsMapArray.forEach((component: any) => {
				componentsMap[component.componentName] = component;
			});

			const packages = material.getAssets()?.packages;
			const libraryMap: any = {};
			const libraryAsset: any = [];
			packages?.forEach(
				({ package: _package, library, urls, renderUrls }: any) => {
					libraryMap[_package] = library;
					if (renderUrls) {
						libraryAsset.push(renderUrls);
					} else if (urls) {
						libraryAsset.push(urls);
					}
				}
			);

			const assetLoader = new AssetLoader();
			await assetLoader.load(libraryAsset);
			components.value = await buildComponents(libraryMap, componentsMap);
		}

		return () => (
			<div>
				<Button
					type={'primary'}
					onClick={() => {
						open.value = true;
					}}
				>
					预览
				</Button>
				<Drawer
					destroyOnClose
					bodyStyle={{ padding: 0 }}
					headerStyle={{ display: 'none' }}
					open={open.value}
					width={'100%'}
					onClose={() => {
						open.value = false;
					}}
				>
					{components.value && (
						<Suspense>
							<MicrocodeRenderer
								schema={schema.value}
								components={{
									...components.value,
								}}
								appHelper={{
									requestHandlersMap: {
										fetch: createAxiosFetchHandler(),
									},
								}}
								requestHandlersMap={{
									fetch: createAxiosFetchHandler(),
								}}
							></MicrocodeRenderer>
						</Suspense>
					)}
				</Drawer>
			</div>
		);
	},
});
