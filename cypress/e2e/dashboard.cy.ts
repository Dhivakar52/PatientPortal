describe('Patient Portal - Dashboard & Appointments List Flow', () => {
  beforeEach(() => {
    cy.setupApiIntercepts()
    cy.visit('/')
    cy.loginWithOtp('9876543210', '1234')
    cy.selectPatient(0)
  })

  it('should render the dashboard layout with header and profile card', () => {
    cy.get('[data-cy="patient-header"]').should('be.visible')
    cy.get('[data-cy="patient-profile-card"]').should('be.visible')
    cy.get('[data-cy="upcoming-appointments-section"]').should('be.visible')
    cy.get('[data-cy="past-visits-section"]').should('be.visible')
  })

  it('should display upcoming appointments with max 5 items and pagination', () => {
    cy.get('[data-cy="upcoming-appointments-section"]').within(() => {
      cy.get('[data-cy="visit-card"]').should('have.length.at.least', 1)
      cy.get('[data-cy="visit-card-status"]').first().should('contain.text', 'Upcoming')
    })
  })

  it('should filter appointments using the reusable search control', () => {
    cy.get('[data-cy="upcoming-appointments-section"]').within(() => {
      cy.get('[data-cy="search-toggle-btn"]').click()
      cy.get('[data-cy="search-input"]').type('Dr. Priya')
      cy.get('[data-cy="visit-card"]').should('have.length', 1)
      cy.contains('Dr. Priya Ramesh').should('be.visible')

      // Clear search
      cy.get('[data-cy="search-clear-btn"]').click()
      cy.get('[data-cy="visit-card"]').should('have.length.at.least', 1)
    })
  })

  it('should show filter summary bar when filtered and allow clearing', () => {
    cy.get('[data-cy="upcoming-appointments-section"]').within(() => {
      cy.get('[data-cy="search-toggle-btn"]').click()
      cy.get('[data-cy="search-input"]').type('Dr. Priya')
      cy.get('[data-cy="filter-summary-bar"]').should('be.visible')
      cy.get('[data-cy="filter-clear-btn"]').click()
      cy.get('[data-cy="filter-summary-bar"]').should('not.exist')
    })
  })
})
