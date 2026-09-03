describe('Patient Portal - Appointment Booking Flow', () => {
  beforeEach(() => {
    cy.setupApiIntercepts()
    cy.visit('/')
    cy.loginWithOtp('9876543210', '1234')
    cy.selectPatient(0) // Ananya (Female)
  })

  it('should navigate to appointment booking tab and render booking form', () => {
    cy.openBooking()
    cy.contains('Book Appointment').should('be.visible')
    cy.get('[data-cy="book-date-picker"]').should('be.visible')
    cy.get('[data-cy="book-slot-hours-select"]').should('be.visible')
    cy.get('[data-cy="book-submit-btn"]').should('be.disabled')
  })

  it('should complete end-to-end appointment booking flow with OTP verification', () => {
    cy.openBooking()

    // 1. Select Date (pick first enabled date button in calendar popover)
    cy.get('[data-cy="book-date-picker"]').click()
    cy.get('button[role="gridcell"]:not([disabled])').first().click({ force: true })

    // 2. Select Time Slot Hours
    cy.get('[data-cy="book-slot-hours-select"]').select(1)
    cy.wait('@getTimeSlots')

    // 3. Select a Time Slot pill
    cy.get('[data-cy="available-slots-section"]').should('be.visible')
    cy.get('[data-cy="slot-pill"]').first().click()

    // 4. Submit Booking to trigger OTP
    cy.get('[data-cy="book-submit-btn"]').should('not.be.disabled').click()
    cy.wait('@getOtp')

    // 5. Verify OTP
    cy.get('[data-cy="booking-otp-modal"]').should('be.visible')
    cy.get('[data-cy="booking-otp-input"]').type('1234')
    cy.get('[data-cy="booking-otp-submit-btn"]').click()

    cy.wait('@saveAppointmentApi')

    // 6. Success Modal
    cy.get('[data-cy="booking-success-modal"]').should('be.visible')
    cy.get('[data-cy="booking-success-appt-no"]').should('be.visible')
    cy.get('[data-cy="booking-success-dashboard-btn"]').click()

    // Redirects back to dashboard
    cy.get('[data-cy="upcoming-appointments-section"]').should('be.visible')
  })

  it('should block Male patients from booking and display male restriction modal', () => {
    // Switch to Rahul Sharma (Male)
    cy.get('[data-cy="account-switch-dropdown"]').click()
    cy.get('[data-cy="switch-patient-item"]').eq(1).click()

    // Attempt to book
    cy.openBooking()
    cy.get('[data-cy="male-restriction-modal"]').should('be.visible')
    cy.contains('Booking Not Allowed').should('be.visible')
    cy.get('[data-cy="male-restriction-ack-btn"]').click()
    cy.get('[data-cy="male-restriction-modal"]').should('not.exist')
  })
})
