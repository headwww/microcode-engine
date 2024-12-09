import renderer from './renderer';

if (typeof window !== 'undefined') {
	(window as any).SimulatorRenderer = renderer;
}

window.addEventListener('beforeunload', () => {
	(window as any).ArvinMicrocodeSimulatorHost = null;
	renderer.dispose();
	(window as any).SimulatorRenderer = null;
	const appElement: any = document.getElementById('simulator-app');
	if (appElement && appElement.__vue_app__) {
		// 卸载vue应用
		appElement.__vue_app__.unmount();
	}
});

export default renderer;
