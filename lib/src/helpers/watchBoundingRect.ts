import { onResize } from "./onResize";

/**
 * Watch the bounding rect of an element and update it on resize and scroll events.
 */
export function watchBoundingRect(target: HTMLElement, params: WatchBoundingRectParams = {}) {
  const {
    windowResize = globalThis.window !== undefined,
    windowScroll = globalThis.window !== undefined,
  } = params;

  const rect: BoundingRect = {
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    x: 0,
    y: 0,
  };

  const center = { x: 0, y: 0 };

  function update() {
    const newRect = target.getBoundingClientRect();

    // update the rect object instead of reassagning to allow destructuring the output of the function
    for (const key of Object.keys(rect) as Array<keyof typeof rect>) {
      rect[key] = newRect[key];
    }

    center.x = (rect.left + rect.right) / 2;
    center.y = (rect.top + rect.bottom) / 2;
  }

  onResize(target, update);

  if (windowScroll) window.addEventListener("scroll", update, { capture: true, passive: true });
  if (windowResize) window.addEventListener("resize", update, { passive: true });

  return {
    rect: rect as Readonly<typeof rect>,
    center: center as Readonly<typeof center>,
  };
}

export interface WatchBoundingRectParams {
  /**
   * Listen to window resize event
   *
   * @default true
   */
  windowResize?: boolean;
  /**
   * Listen to window scroll event
   *
   * @default true
   */
  windowScroll?: boolean;
}

export interface BoundingRect {
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
  x: number;
  y: number;
}
