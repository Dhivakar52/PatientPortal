import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 8000,
    requestTimeout: 8000,
    responseTimeout: 8000,
    setupNodeEvents(_on, config) {
      return config
    },
  },
  env: {
    apiUrl: 'http://172.16.5.106:1478',
  },
})
