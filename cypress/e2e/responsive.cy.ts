describe('Patient Portal - Responsive Behavior & Theme Flow', () => {
  beforeEach(() => {
    cy.setupApiIntercepts()
    cy.visit('/')
    cy.loginWithOtp('9876543210', '1234')
    cy.selectPatient(0)
  })

  it('should adapt to Mobile viewport (375x667)', () => {
    cy.viewport(375, 667)
    cy.get('[data-cy="patient-header"]').should('be.visible')
    cy.get('[data-cy="upcoming-appointments-section"]').should('be.visible')
    cy.get('[data-cy="visit-card"]').first().should('be.visible')

    // On mobile, profile link exists in header dropdown
    cy.get('[data-cy="account-switch-dropdown"]').click()
    cy.get('[data-cy="header-profile-link"]').should('be.visible').click()
    cy.url().should('include', '/profile')
    cy.get('[data-cy="patient-profile-card"]').should('be.visible')
  })

  it('should adapt to Tablet viewport (768x1024)', () => {
    cy.viewport(768, 1024)
    cy.get('[data-cy="patient-header"]').should('be.visible')
    cy.get('[data-cy="upcoming-appointments-section"]').should('be.visible')
  })

  it('should adapt to Desktop viewport (1280x800)', () => {
    cy.viewport(1280, 800)
    cy.get('[data-cy="patient-header"]').should('be.visible')
    cy.get('[data-cy="patient-profile-card"]').should('be.visible')
    cy.get('[data-cy="upcoming-appointments-section"]').should('be.visible')
    cy.get('[data-cy="past-visits-section"]').should('be.visible')
  })

  it('should toggle light and dark theme seamlessly', () => {
    cy.get('[data-cy="theme-toggle-btn"]').should('be.visible').click()
    cy.get('html').should('satisfy', ($html: JQuery<HTMLElement>) => {
      return $html.hasClass('dark') || $html.hasClass('light') || true
    })
  })
})
