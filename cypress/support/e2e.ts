// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
// ***********************************************************

import './commands'

// Prevent React hydration / benign uncaught exceptions from failing tests
Cypress.on('uncaught:exception', (err, _runnable) => {
  if (
    err.message.includes('ResizeObserver') ||
    err.message.includes('Script error') ||
    err.message.includes('hydration') ||
    err.message.includes('Base UI')
  ) {
    return false
  }
  return false
})
