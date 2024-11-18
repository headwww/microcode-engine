import { AssetList } from '@arvin-shu/microcode-types';
import { BuiltinSimulatorHost } from './host';

export function createSimulator(
	host: BuiltinSimulatorHost,
	iframe: HTMLIFrameElement,
	vendors: AssetList = []
) {
	const doc = iframe.contentDocument!;
	vendors;
	doc.open();
	doc.write(
		`
        <!DOCTYPE html>
        <html class="engine-design-mode">
            <head>
                <meta charset="UTF-8"/>
            </head>
            <body>

            </body>
        </html>
        `
	);
	doc.close();

	return new Promise((resolve) => {
		const renderer = window.SimulatorRenderer;
		if (renderer) {
			resolve(renderer);
		}
	});
}
