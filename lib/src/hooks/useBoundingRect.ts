import { useResizeObserver } from "./useResizeObserver";

export interface UseBoundingRectOptions {
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

/**
 * Dynamically get the bounding rectangle of an HTML element
 */
export function useBoundingRect(target: HTMLElement, options: UseBoundingRectOptions = {}) {
  /* eslint-disable unicorn/prefer-global-this */
  const {
    windowResize = typeof window !== "undefined",
    windowScroll = typeof window !== "undefined",
  } = options;

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

  useResizeObserver(target, update);

  if (windowScroll) window.addEventListener("scroll", update, { capture: true, passive: true });
  if (windowResize) window.addEventListener("resize", update, { passive: true });

  return {
    rect: rect as Readonly<typeof rect>,
    center: center as Readonly<typeof center>,
  };
}
