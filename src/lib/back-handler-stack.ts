/**
 * Module-level stack of hardware back button interceptors.
 *
 * Screens that need to handle back themselves (e.g. cancel an in-progress
 * edit instead of navigating away) push a handler while active and pop it
 * on unmount. The global hardware back listener always invokes the topmost
 * handler, falling back to normal navigation when the stack is empty.
 */

type BackHandler = () => void;

const stack: BackHandler[] = [];

export function pushBackHandler(handler: BackHandler): void {
  stack.push(handler);
}

export function removeBackHandler(handler: BackHandler): void {
  const index = stack.lastIndexOf(handler);
  if (index !== -1) stack.splice(index, 1);
}

export function invokeTopBackHandler(): boolean {
  const top = stack[stack.length - 1];
  if (!top) return false;
  top();
  return true;
}
