/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Document {
  startViewTransition(callback: () => Promise<void> | void): {
    ready: Promise<void>;
    finished: Promise<void>;
    updateCallbackDone: Promise<void>;
    skipTransition(): void;
  };
}
