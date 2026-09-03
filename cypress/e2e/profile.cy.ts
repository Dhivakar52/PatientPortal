describe('Patient Portal - Profile Management Flow', () => {
  beforeEach(() => {
    cy.setupApiIntercepts()
    cy.visit('/')
    cy.loginWithOtp('9876543210', '1234')
    cy.selectPatient(0)
  })

  it('should display patient details on the profile card', () => {
    cy.get('[data-cy="patient-profile-card"]').should('be.visible')
    cy.get('[data-cy="profile-display-name"]').should('contain.text', 'Ananya')
    cy.get('[data-cy="profile-gender"]').should('contain.text', 'Female')
    cy.get('[data-cy="profile-phone"]').should('contain.text', '9876543210')
    cy.get('[data-cy="profile-uhid"]').should('contain.text', 'UHID-100234')
  })

  it('should open edit profile modal and allow updating profile information', () => {
    cy.get('[data-cy="edit-profile-btn"]').click()
    cy.get('[data-cy="edit-patient-modal"]').should('be.visible')

    cy.get('[data-cy="edit-patient-name"]').should('have.value', 'Ananya Sharma')
    cy.get('[data-cy="edit-patient-email"]').clear().type('ananya.updated@example.com')
    cy.get('[data-cy="edit-patient-address"]').clear().type('123 Health Ave, Chennai')

    cy.get('[data-cy="edit-patient-submit-btn"]').click()
    cy.wait('@updatePatientApi')
    cy.get('[data-cy="edit-patient-modal"]').should('not.exist')
  })
})
