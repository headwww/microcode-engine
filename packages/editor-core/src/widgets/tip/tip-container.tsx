import {
	defineComponent,
	onBeforeUnmount,
	onMounted,
	onUpdated,
	ref,
	Teleport,
} from 'vue';
import { tipHandler } from './tip-handler';
import { resolvePosition } from './utils';
import { intl } from '../../inti';

export const TipContainer = defineComponent({
	name: 'TipContainer',
	setup() {
		let dispose: (() => void) | undefined;

		onMounted(() => {
			const over = (e: MouseEvent) => tipHandler.setTarget(e.target as any);
			const down = () => tipHandler.hideImmediately();

			document.addEventListener('mouseover', over, false);
			document.addEventListener('mousedown', down, true);

			dispose = () => {
				document.removeEventListener('mouseover', over, false);
				document.removeEventListener('mousedown', down, true);
			};
		});

		onBeforeUnmount(() => {
			if (dispose) {
				dispose();
			}
		});
		return () => (
			<Teleport to="body">
				<div class="mtc-tips-container">
					<TipItem></TipItem>
				</div>
			</Teleport>
		);
	},
});

export const TipItem = defineComponent({
	name: 'TipItem',
	setup() {
		const dispose = tipHandler.onChange(() => {
			updateTip();
		});

		const shell = ref<HTMLDivElement>();

		const updateTip = () => {
			if (!shell.value) {
				return;
			}
			const arrow = shell.value.querySelector('.mtc-arrow') as HTMLElement;

			shell.value.className = getClass();
			shell.value.style.cssText = '';
			arrow.style.cssText = '';
			clearTimer();

			const { tip } = tipHandler;
			if (!tip) {
				return;
			}
			const { target, direction, children } = tip;
			text.value = children;
			const targetRect = target.getBoundingClientRect();

			if (targetRect.width === 0 || targetRect.height === 0) {
				return;
			}

			const shellRect = shell.value.getBoundingClientRect();
			const bounds = {
				left: 1,
				top: 1,
				right: document.documentElement.clientWidth - 1,
				bottom: document.documentElement.clientHeight - 1,
			};
			const arrowRect = arrow.getBoundingClientRect();
			const { dir, left, top, arrowLeft, arrowTop } = resolvePosition(
				shellRect,
				targetRect,
				arrowRect,
				bounds,
				direction
			);

			shell.value.classList.add(`mtc-align-${dir}`);
			shell.value.style.top = `${top}px`;
			shell.value.style.left = `${left}px`;
			shell.value.style.width = `${shellRect.width}px`;
			shell.value.style.height = `${shellRect.height}px`;

			if (dir === 'top' || dir === 'bottom') {
				arrow.style.left = `${arrowLeft}px`;
			} else {
				arrow.style.top = `${arrowTop}px`;
			}

			timer = window.setTimeout(() => {
				if (shell.value) {
					shell.value.classList.add('mtc-visible-animate');
					shell.value.style.transform = 'none';
				}
			}, 10);
		};

		onMounted(() => {
			updateTip();
		});

		onUpdated(() => {
			updateTip();
		});

		onBeforeUnmount(() => {
			if (dispose) {
				dispose();
			}
			clearTimer();
		});

		let timer: number | null = null;

		function clearTimer() {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
		}

		function getClass() {
			const classes = ['mtc-tip'];
			if (tipHandler.tip?.className) {
				classes.push(tipHandler.tip?.className);
			}
			if (tipHandler.tip && tipHandler.tip.theme) {
				classes.push(`mtc-theme-${tipHandler.tip.theme}`);
			}
			return classes.join(' ');
		}

		const text = ref();
		return () => (
			<div class={getClass()} ref={shell}>
				<i class="mtc-arrow" />
				<div class="mtc-tip-content">{intl(text.value)}</div>
			</div>
		);
	},
});
