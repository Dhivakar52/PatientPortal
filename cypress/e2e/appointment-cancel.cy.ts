describe('Patient Portal - Appointment Cancellation Flow', () => {
  beforeEach(() => {
    cy.setupApiIntercepts()
    cy.visit('/')
    cy.loginWithOtp('9876543210', '1234')
    cy.selectPatient(0)
  })

  it('should complete two-step appointment cancellation flow (Reason -> OTP -> Confirm)', () => {
    cy.get('[data-cy="upcoming-appointments-section"]').within(() => {
      cy.get('[data-cy="visit-card-menu-btn"]').first().click()
    })

    cy.get('[data-cy="visit-card-cancel-btn"]').should('be.visible').click()

    // STEP 1: Reason
    cy.get('[data-cy="cancel-modal"]').should('be.visible')
    cy.get('[data-cy="cancel-continue-btn"]').should('be.disabled')
    cy.get('[data-cy="cancel-reason-input"]').type('Personal emergency and travel scheduled')
    cy.get('[data-cy="cancel-continue-btn"]').should('not.be.disabled').click()

    cy.wait('@getOtp')

    // STEP 2: OTP
    cy.get('[data-cy="cancel-otp-input"]').should('be.visible')
    cy.get('[data-cy="cancel-otp-input"]').type('1234')
    cy.get('[data-cy="cancel-verify-otp-btn"]').click()

    cy.wait('@updateAppointmentApi')
    cy.get('[data-cy="cancel-modal"]').should('not.exist')
  })

  it('should allow going back from OTP step to Reason step', () => {
    cy.get('[data-cy="upcoming-appointments-section"]').within(() => {
      cy.get('[data-cy="visit-card-menu-btn"]').first().click()
    })

    cy.get('[data-cy="visit-card-cancel-btn"]').click()
    cy.get('[data-cy="cancel-reason-input"]').type('Need to change schedule')
    cy.get('[data-cy="cancel-continue-btn"]').click()
    cy.wait('@getOtp')

    cy.get('[data-cy="cancel-back-btn"]').click()
    cy.get('[data-cy="cancel-reason-input"]').should('be.visible').and('have.value', 'Need to change schedule')
  })
})
