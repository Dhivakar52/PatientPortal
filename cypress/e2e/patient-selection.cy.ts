describe('Patient Portal - Patient Profile Selection Flow', () => {
  beforeEach(() => {
    cy.setupApiIntercepts()
    cy.visit('/')
    cy.loginWithOtp('9876543210', '1234')
  })

  it('should render all registered patient profile cards', () => {
    cy.get('[data-cy="patient-card"]').should('have.length.at.least', 2)
    cy.contains('Ananya Sharma').should('be.visible')
    cy.contains('Rahul Sharma').should('be.visible')
  })

  it('should allow selecting a patient card and continuing to dashboard', () => {
    // Click on the first patient
    cy.get('[data-cy="patient-card"]').first().click()
    cy.get('[data-cy="patient-select-continue-btn"]').should('not.be.disabled').click()

    cy.wait('@getAppointments')
    cy.url().should('include', '/patient/dashboard')
    cy.get('[data-cy="patient-header"]').should('be.visible')
  })

  it('should open edit patient modal from patient selection page', () => {
    cy.get('[data-cy="edit-patient-btn"]').first().click()
    cy.get('[data-cy="edit-patient-modal"]').should('be.visible')
    cy.get('[data-cy="edit-patient-name"]').should('have.value', 'Ananya Sharma')

    cy.get('[data-cy="edit-patient-close-btn"]').click()
    cy.get('[data-cy="edit-patient-modal"]').should('not.exist')
  })

  it('should open delete patient confirmation dialog', () => {
    cy.get('[data-cy="delete-patient-btn"]').first().click()
    cy.get('[data-cy="delete-dialog"]').should('be.visible')
    cy.contains('Delete Patient Profile').should('be.visible')

    cy.get('[data-cy="delete-cancel-btn"]').click()
    cy.get('[data-cy="delete-dialog"]').should('not.exist')
  })
})
