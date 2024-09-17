module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-prettier'],
  rules: {
    'prettier/prettier': true,
    // Ignore "display: -webkit-box;"
    // This line clampin technique only works with the webkit prefix.
    // https://css-tricks.com/line-clampin/
    'value-no-vendor-prefix': [true, { ignoreValues: ['box'] }],
    'property-no-unknown': [
      true,
      {
        ignoreProperties: ['position-anchor', 'inset-area'],
      },
    ],
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['anchor-size'],
      },
    ],
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['popover-open'],
      },
    ],
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['starting-style'],
      },
    ],
  },
}
