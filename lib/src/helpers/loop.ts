const allLoops: Array<LoopObj> = [];

/**
 * Creates an animation loop that calls the provided callback on every animation frame.
 * @param callback A function that will be called on every animation frame.
 * @param params parameters for the loop.
 * @returns  An object with `play` and `pause` methods to control the animation loop.
 */
export function loop(callback: ({ time, deltaTime }: LoopData) => void, params?: LoopParams) {
  let animationFrameHandle: number;
  let pauseTime: number | null;
  let loopStartTime: number;
  let delay = 0;

  const { immediate = true } = params || {};

  function loopFn(previousTime: number, delay = 0) {
    const currentTime = performance.now();
    const elapsedTime = currentTime - loopStartTime;
    const time = elapsedTime - delay;
    const deltaTime = currentTime - previousTime;
    callback({ time, elapsedTime, deltaTime });

    animationFrameHandle = requestAnimationFrame(() => loopFn(currentTime, delay));
  }

  function play() {
    const currentTime = performance.now();
    if (loopStartTime === undefined) {
      loopStartTime = performance.now();
    }
    delay += currentTime - (pauseTime || currentTime);
    cancelAnimationFrame(animationFrameHandle);
    animationFrameHandle = requestAnimationFrame(() => loopFn(currentTime, delay));
    pauseTime = null;
  }

  function pause() {
    if (pauseTime == null) {
      pauseTime = performance.now();
    }
    cancelAnimationFrame(animationFrameHandle);
  }

  if (immediate) {
    play();
  }

  const loop: LoopObj = { play, pause };

  allLoops.push(loop);

  return loop;
}

/**
 * Play all loops that have been registered with `loop`.
 */
export function playAllLoops() {
  for (const loop of allLoops) {
    loop.play();
  }
}

/**
 * Pause all loops that have been registered with `loop`.
 */
export function pauseAllLoops() {
  for (const loop of allLoops) {
    loop.pause();
  }
}

export interface LoopData {
  /**
   * time elapsed in milliseconds since the loop started, excluding pauses.
   *
   * This timer is paused when the loop is paused, to avoid jumps in animations. If you want to get the time elapsed including pauses, use `elapsedTime` instead.
   */
  time: number;
  /**
   * Δt in milliseconds since the previous loop iteration.
   */
  deltaTime: number;
  /**
   * time elapsed in milliseconds since the loop started, including pauses.
   *
   * This timer is NOT paused when the loop is paused, which can cause jumps in animations. If you want to get the time elapsed excluding pauses, use `time` instead.
   */
  elapsedTime: number;
}

export interface LoopParams {
  /**
   * If true, the loop will start immediately.
   *
   * If false, the loop will start when the `play` method is called.
   * @default true
   */
  immediate?: boolean;
}

export interface LoopObj {
  /** Play the animation loop. */
  play: () => void;
  /** Pause the animation loop. */
  pause: () => void;
}
