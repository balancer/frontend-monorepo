// Silences "Download the Apollo DevTools for a better development experience" message
// https://github.com/apollographql/apollo-client/issues/10098
vi.stubGlobal('__DEV__', false)

// Silences "Warning: The installed version of React DevTools is too old and will not work with the current version of React." message
vi.stubGlobal('__REACT_DEVTOOLS_GLOBAL_HOOK__', { isDisabled: true })
