// Wildcard module declaration for the ui-playground submodule.
//
// The submodule has its own tsconfig with looser strictness (no
// noUncheckedIndexedAccess) and typechecks cleanly in its own repo. From
// portfolio's stricter compiler, every demo would surface dozens of false
// "possibly undefined" errors. Treating @playground/* as opaque is the
// right boundary — the submodule is a build-time dependency, not part of
// the portfolio's type-checked surface area.
//
// All imports from @playground/* resolve to `any`. Runtime resolution
// still happens via the Vite alias in vite.config.ts.
declare module '@playground/*';
