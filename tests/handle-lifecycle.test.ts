import assert from "node:assert/strict";
import { test } from "node:test";
import { handleLifecycle } from "../src/ui/handle-lifecycle";

test("React disconnect/reconnect uses a new SDK owner, including previously captured methods", () => {
 let created = 0, destroyed = 0;
 const owner = handleLifecycle(() => {
  const id = ++created;
  let dead = false;
  return {
   create() { if (dead) throw new Error("this handle was torn down"); return id; },
   destroy() { dead = true; destroyed++; },
  };
 }, handle => handle.destroy());
 const createElement = owner.handle.create;
 owner.activate();
 assert.equal(createElement(), 1);
 assert.equal(createElement(), 1);
 owner.release();
 assert.equal(destroyed, 1);
 assert.throws(() => createElement(), /not mounted/);
 owner.activate();
 assert.equal(createElement(), 2);
 owner.release();
 owner.release();
 assert.equal(destroyed, 2);
});

test("nested card units reconnect to the current wallet and never allocate after unmount", () => {
 let generation = 0;
 const wallet = handleLifecycle(() => {
  const id = ++generation; let dead = false;
  return {
   create() {
    if (dead) throw new Error("wallet destroyed");
    let unitDead = false;
    return { create() { if (dead || unitDead) throw new Error("unit destroyed"); return id; }, destroy() { unitDead = true; } };
   },
   destroy() { dead = true; },
  };
 }, handle => handle.destroy());
 const unit = handleLifecycle(() => wallet.handle.create(), handle => handle.destroy());
 for (let cycle = 1; cycle <= 3; cycle++) {
  wallet.activate(); unit.activate();
  assert.equal(unit.handle.create(), cycle);
  wallet.release(); unit.release();
 }
 assert.throws(() => unit.handle.create(), /not mounted/);
 assert.equal(generation, 3);
});
