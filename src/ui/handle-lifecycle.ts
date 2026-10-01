/** Own an SDK resource across React effect disconnect/reconnect cycles.
 * Its stable facade never retains methods bound to a destroyed SDK handle.
 * Activation happens in layout effects, before child passive effects mount Elements.
 */
export function handleLifecycle<T extends object>(create: () => T, destroy: (handle: T) => void) {
 let active = false;
 let current: T | null = null;
 const get = () => {
  if (!active) throw new Error("Element owner is not mounted.");
  return current ??= create();
 };
 const handle = new Proxy({} as T, {
  get(_target, key) {
   // Resolve at call time; consumers may retain a public method across a reconnect.
   return (...args: unknown[]) => {
    const owner = get();
    const method = Reflect.get(owner, key);
    if (typeof method !== "function") throw new Error(`Unsupported Element method: ${String(key)}`);
    return Reflect.apply(method, owner, args);
   };
  },
 });
 return {
  handle,
  activate() { active = true; },
  release() {
   active = false;
   const previous = current;
   current = null;
   if (previous) destroy(previous);
  },
 };
}
