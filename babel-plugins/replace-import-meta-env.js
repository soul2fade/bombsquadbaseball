// Replaces `import.meta.env` with `{ MODE: "production" }` at build time.
// Needed because Metro's web bundler does not handle `import.meta` and emits
// the literal syntax, which throws SyntaxError when loaded as a classic
// <script>. Zustand 4.5+ uses `import.meta.env?.MODE` for dev warnings.
module.exports = function () {
  return {
    name: 'replace-import-meta-env',
    visitor: {
      MetaProperty(path) {
        if (
          path.node.meta &&
          path.node.meta.name === 'import' &&
          path.node.property &&
          path.node.property.name === 'meta' &&
          path.parentPath.isMemberExpression() &&
          path.parent.property &&
          path.parent.property.name === 'env'
        ) {
          path.parentPath.replaceWithSourceString('({ MODE: "production" })');
        }
      },
    },
  };
};
