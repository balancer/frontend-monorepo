// `debug` (and a few other packages) declare `supports-color` as an optional
// peer via peerDependenciesMeta. pnpm folds the resolved peer version into each
// package's resolution context, and different importers can end up on different
// copies (supports-color@8.1.1 vs 10.2.2). That context difference cascades
// into @babel/core -> @emotion/react -> @chakra-ui/react -> next, which makes
// pnpm install TWO physical copies of the entire Chakra/Emotion/Next chain for
// apps/balancer-analytics. App code and @repo/lib then resolve different
// Chakra/Emotion instances, the ChakraProvider theme never reaches lib
// components, and the analytics UI renders broken (see PR #2883).
// Stripping the optional peer removes the divergence axis entirely so every
// importer shares a single instance. `debug` only uses it to detect terminal
// color support when present, so this is safe.
module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.peerDependenciesMeta?.['supports-color']?.optional) {
        delete pkg.peerDependenciesMeta['supports-color'];
      }
      if (pkg.peerDependencies?.['supports-color']) {
        delete pkg.peerDependencies['supports-color'];
      }
      return pkg;
    },
  },
};
