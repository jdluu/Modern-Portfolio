/// <reference types="solid-js" />
// This file ensures VS Code's TypeScript server loads Solid's JSX typings,
// fixing "JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists.ts(7026)"
// in .tsx and .astro islands.
// Keep this file in your tsconfig "include" (already includes src/**/* by default).
