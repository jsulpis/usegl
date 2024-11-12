import type { BoundingRect } from "./useBoundingRect";
import { useBoundingRect } from "./useBoundingRect";

type HandlerArgs = {
	pointer: {
		x: number;
		y: number;
	};
	canvasRect: BoundingRect;
	canvasCenter: {
		x: number;
		y: number;
	};
};

type PointerEventsHandlers = {
	enter?: ({ pointer, canvasRect, canvasCenter }: HandlerArgs) => void;
	move?: ({ pointer, canvasRect, canvasCenter }: HandlerArgs) => void;
	leave?: ({ pointer, canvasRect, canvasCenter }: HandlerArgs) => void;
	down?: ({ pointer, canvasRect, canvasCenter }: HandlerArgs) => void;
	up?: ({ pointer, canvasRect, canvasCenter }: HandlerArgs) => void;
};

/**
 * Listen to common pointer events and provide additional infos about the canvas
 */
export function usePointerEvents(canvas: HTMLCanvasElement, handlers: PointerEventsHandlers) {
	const { rect: canvasRect, center: canvasCenter } = useBoundingRect(canvas);

	const activeHandlers = Object.fromEntries(
		Object.entries(handlers)
			.filter(([, handler]) => typeof handler === "function")
			.map(([handlerName, handlerFunction]) => [
				handlerName,
				(e: PointerEvent) => {
					handlerFunction({
						pointer: { x: e.clientX, y: e.clientY },
						canvasRect,
						canvasCenter,
					});
				},
			]),
	);

	function listen() {
		for (const [event, handler] of Object.entries(activeHandlers)) {
			canvas.addEventListener(`pointer${event as keyof PointerEventsHandlers}`, handler, {
				passive: true,
			});
		}
	}

	function stop() {
		for (const [event, handler] of Object.entries(activeHandlers)) {
			canvas.removeEventListener(`pointer${event as keyof PointerEventsHandlers}`, handler);
		}
	}

	listen();

	return { stop, listen };
}
