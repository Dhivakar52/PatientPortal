describe('Patient Portal - Account & Profile Switching Flow', () => {
  beforeEach(() => {
    cy.setupApiIntercepts()
    cy.visit('/')
    cy.loginWithOtp('9876543210', '1234')
    cy.selectPatient(0)
  })

  it('should switch between patient profiles within the current account', () => {
    cy.get('[data-cy="header-display-name"]').should('contain.text', 'Ananya')

    // Open dropdown
    cy.get('[data-cy="account-switch-dropdown"]').click()
    cy.get('[data-cy="switch-patient-item"]').should('have.length.at.least', 2)

    // Select second patient (Rahul Sharma)
    cy.get('[data-cy="switch-patient-item"]').eq(1).click()
    cy.get('[data-cy="header-display-name"]').should('contain.text', 'Rahul')
    cy.get('[data-cy="profile-display-name"]').should('contain.text', 'Rahul')
  })

  it('should log out successfully from the header menu', () => {
    cy.get('[data-cy="account-switch-dropdown"]').click()
    cy.get('[data-cy="header-logout-btn"]').should('be.visible').click()

    cy.get('[data-cy="login-mobile"]').should('be.visible')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})
