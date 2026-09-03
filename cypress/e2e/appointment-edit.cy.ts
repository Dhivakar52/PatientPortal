describe('Patient Portal - Edit / Reschedule Appointment Flow', () => {
  beforeEach(() => {
    cy.setupApiIntercepts()
    cy.visit('/')
    cy.loginWithOtp('9876543210', '1234')
    cy.selectPatient(0)
  })

  it('should open edit panel for future appointments and allow rescheduling', () => {
    cy.get('[data-cy="upcoming-appointments-section"]').within(() => {
      cy.get('[data-cy="visit-card-menu-btn"]').first().click()
    })

    cy.get('[data-cy="visit-card-edit-btn"]').should('be.visible').click()
    cy.get('[data-cy="edit-appointment-panel"]').should('be.visible')

    // Change appointment date
    cy.get('[data-cy="edit-appointment-date"]').click()
    cy.get('button[role="gridcell"]:not([disabled])').last().click({ force: true })

    // Change time slot hours
    cy.get('[data-cy="edit-appointment-slot-hours"]').select(1)
    cy.wait('@getTimeSlots')

    // Select new time slot pill
    cy.get('[data-cy="edit-slot-pill"]').first().click()

    // Submit reschedule
    cy.get('[data-cy="edit-appointment-submit-btn"]').should('not.be.disabled').click()
    cy.wait('@updateAppointmentApi')
    cy.get('[data-cy="edit-appointment-panel"]').should('not.exist')
  })

  it('should allow closing the edit appointment panel without saving', () => {
    cy.get('[data-cy="upcoming-appointments-section"]').within(() => {
      cy.get('[data-cy="visit-card-menu-btn"]').first().click()
    })

    cy.get('[data-cy="visit-card-edit-btn"]').click()
    cy.get('[data-cy="edit-appointment-panel"]').should('be.visible')
    cy.get('[data-cy="edit-appointment-cancel-btn"]').click()
    cy.get('[data-cy="edit-appointment-panel"]').should('not.exist')
  })
})
