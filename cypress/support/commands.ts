/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Sets up standard API intercepts for mock backend testing.
       */
      setupApiIntercepts(options?: {
        existUser?: boolean
        usersFixture?: string
        patientFixture?: string
        appointmentsFixture?: string
        doctorsFixture?: string
        timeslotsFixture?: string
        delayMs?: number
      }): Chainable<void>

      /**
       * Performs login with phone number and OTP.
       */
      loginWithOtp(mobile?: string, otp?: string, existUser?: boolean): Chainable<void>

      /**
       * Selects a patient on the Patient Selection screen.
       */
      selectPatient(patientName?: string): Chainable<void>

      /**
       * Switches active patient from the Patient Header dropdown.
       */
      switchAccount(patientName: string): Chainable<void>

      /**
       * Navigates to Book Appointment screen/tab.
       */
      openBooking(): Chainable<void>
    }
  }
}

Cypress.Commands.add('setupApiIntercepts', (options = {}) => {
  const {
    existUser = true,
    usersFixture = 'users.json',
    patientsFixture = 'patients.json',
    appointmentsFixture = 'appointments.json',
    doctorsFixture = 'doctors.json',
    timeslotsFixture = 'timeslots.json',
    delayMs = 0,
  } = options

  // 1. Generate OTP
  cy.intercept('POST', '**/api/generateotp', (req) => {
    if (delayMs > 0) req.reply((res) => { res.setDelay(delayMs); res.send({ statusCode: 200, body: { Result: 'OTP sent successfully', Status: 1 } }) })
    else req.reply({ statusCode: 200, body: { Result: 'OTP sent successfully', Status: 1 } })
  }).as('generateOtpApi')

  // 2. Validate OTP
  cy.intercept('GET', '**/api/validateotp*', (req) => {
    if (delayMs > 0) {
      req.reply((res) => {
        res.setDelay(delayMs)
        res.send({
          statusCode: 200,
          body: {
            Result: 'OTP successfully validated',
            UserID: 101,
            ExistUser: existUser,
          },
        })
      })
    } else {
      req.reply({
        statusCode: 200,
        body: {
          Result: 'OTP successfully validated',
          UserID: 101,
          ExistUser: existUser,
        },
      })
    }
  }).as('validateOtpApi')

  // 3. Get Users
  cy.intercept('GET', '**/api/getusers*', { fixture: usersFixture }).as('getUsersApi')

  // 4. Fetch Patient
  cy.intercept('GET', '**/api/fetchpatient*', (req) => {
    cy.fixture(patientsFixture).then((patients) => {
      const url = new URL(req.url)
      const patientId = url.searchParams.get('patientID') || url.searchParams.get('patientId')
      if (patientId === '1002') {
        req.reply({ statusCode: 200, body: patients.rahul })
      } else {
        req.reply({ statusCode: 200, body: patients.priya })
      }
    })
  }).as('fetchPatientApi')

  // 5. Dashboard
  cy.intercept('GET', '**/api/dashboard*', (req) => {
    cy.fixture(appointmentsFixture).then((appts) => {
      req.reply({
        statusCode: 200,
        body: {
          UpcomingAppointments: appts.upcoming || [],
          PastVisits: appts.past || [],
        },
      })
    })
  }).as('dashboardApi')

  // 6. Fetch Appointments (Visits)
  cy.intercept('GET', '**/api/fetchappointment*', (req) => {
    cy.fixture(appointmentsFixture).then((appts) => {
      req.reply({
        statusCode: 200,
        body: [...(appts.upcoming || []), ...(appts.past || [])],
      })
    })
  }).as('fetchAppointmentsApi')

  // 7. Doctors
  cy.intercept('GET', '**/api/doctor*', { fixture: doctorsFixture }).as('doctorsApi')

  // 8. Time Slots
  cy.intercept('GET', '**/api/timeslot*', { fixture: timeslotsFixture }).as('timeslotsApi')

  // 9. Master data - States & Cities
  cy.intercept('GET', '**/api/state*', [
    { StateID: 1, StateName: 'Tamil Nadu' },
    { StateID: 2, StateName: 'Karnataka' },
  ]).as('statesApi')

  cy.intercept('GET', '**/api/city*', [
    { CityID: 1, CityName: 'Chennai', StateID: 1 },
    { CityID: 2, CityName: 'Coimbatore', StateID: 1 },
    { CityID: 3, CityName: 'Bengaluru', StateID: 2 },
  ]).as('citiesApi')

  // 10. Save Patient (Register)
  cy.intercept('POST', '**/api/savepatient', {
    statusCode: 200,
    body: {
      Result: 'Patient registered successfully',
      PatientID: 1003,
      UserID: 103,
      Status: 1,
    },
  }).as('savePatientApi')

  // 11. Save Appointment
  cy.intercept('POST', '**/api/saveappointment', {
    statusCode: 200,
    body: {
      Result: 'Appointment booked successfully',
      AppointmentID: 504,
      ApptNo: 'APT-20260920-100504',
      Status: 1,
    },
  }).as('saveAppointmentApi')

  // 12. Update Appointment
  cy.intercept('PUT', '**/api/updateappointment/*', {
    statusCode: 200,
    body: {
      Result: 'Appointment rescheduled successfully',
      Status: 1,
    },
  }).as('updateAppointmentApi')

  // 13. Cancel Appointment
  cy.intercept('PUT', '**/api/cancelappointment/*', {
    statusCode: 200,
    body: {
      Result: 'Appointment cancelled successfully',
      Status: 1,
    },
  }).as('cancelAppointmentApi')
})

Cypress.Commands.add('loginWithOtp', (mobile = '9876543210', otp = '1234', existUser = true) => {
  cy.setupApiIntercepts({ existUser })
  cy.visit('/')

  // Enter mobile number
  cy.get('[data-cy="login-mobile"]').should('be.visible').clear().type(mobile)
  cy.get('[data-cy="generate-otp-btn"]').should('not.be.disabled').click()

  // Wait for OTP generation
  cy.wait('@generateOtpApi')

  // Fill OTP
  cy.get('[data-cy="otp-input"]').should('be.visible').type(otp)
  cy.get('[data-cy="verify-otp-btn"]').should('not.be.disabled').click()

  // Wait for validation
  cy.wait('@validateOtpApi')
})

Cypress.Commands.add('selectPatient', (patientName = 'Priya Sharma') => {
  cy.wait('@getUsersApi')
  cy.contains('[data-cy="patient-card"]', patientName).within(() => {
    cy.get('[data-cy="select-patient-btn"]').click()
  })
})

Cypress.Commands.add('switchAccount', (patientName: string) => {
  cy.get('[data-cy="account-switch-dropdown"]').click()
  cy.contains('[data-cy="switch-patient-item"]', patientName).click()
})

Cypress.Commands.add('openBooking', () => {
  cy.get('[data-cy="book-appointment-btn"]').first().click()
})

export {}
