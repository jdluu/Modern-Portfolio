/**
 * Simple ts-morph script to remove unused imports from .ts/.tsx files.
 * It will scan src/ and update files in-place.
 *
 * Run with: node ./scripts/cleanup-unused-imports.js
 */
const { Project, ts } = require("ts-morph");
const path = require("path");

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const srcDir = path.resolve(__dirname, "..", "src");
const sourceFiles = project.addSourceFilesAtPaths("src/**/*.{ts,tsx}");

let changed = 0;

for (const sf of sourceFiles) {
  const importDeclarations = sf.getImportDeclarations();
  let fileChanged = false;

  for (const imp of importDeclarations) {
    const named = imp.getNamedImports();
    const defaultImport = imp.getDefaultImport();
    const namespaceImport = imp.getNamespaceImport();

    // Skip if namespace import (can't safely remove)
    if (namespaceImport) continue;

    // Check default import usage
    if (defaultImport) {
      const name = defaultImport.getText();
      const refs = sf
        .getDescendantsOfKind(ts.SyntaxKind.Identifier)
        .filter((id) => id.getText() === name);
      if (refs.length <= 1) {
        // remove default import
        defaultImport.remove();
        fileChanged = true;
      }
    }

    for (const n of named) {
      const name = n.getName();
      const refs = sf
        .getDescendantsOfKind(ts.SyntaxKind.Identifier)
        .filter((id) => id.getText() === name);
      if (refs.length <= 1) {
        n.remove();
        fileChanged = true;
      }
    }

    // If the import has no specifiers left, remove the whole import
    if (
      imp.getNamedImports().length === 0 &&
      !imp.getDefaultImport() &&
      !imp.getNamespaceImport()
    ) {
      imp.remove();
      fileChanged = true;
    }
  }

  if (fileChanged) {
    sf.saveSync();
    changed++;
  }
}

console.log(`Cleanup complete. Files changed: ${changed}`);
