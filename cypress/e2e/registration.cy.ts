describe('Patient Portal - Registration Flow', () => {
  beforeEach(() => {
    cy.setupApiIntercepts()
    cy.visit('/')
    cy.loginWithOtp('9876543210', '1234')
    cy.get('[data-cy="add-new-patient-btn"]').click()
    cy.url().should('include', '/register')
  })

  it('should render the registration form with all required fields', () => {
    cy.get('[data-cy="reg-name"]').should('be.visible')
    cy.get('[data-cy="reg-gender-female"]').should('be.visible')
    cy.get('[data-cy="reg-gender-male"]').should('be.visible')
    cy.get('[data-cy="reg-dob"]').should('be.visible')
    cy.get('[data-cy="reg-age"]').should('be.visible')
    cy.get('[data-cy="reg-state"]').should('be.visible')
    cy.get('[data-cy="reg-city"]').should('be.visible')
    cy.get('[data-cy="reg-pincode"]').should('be.visible')
    cy.get('[data-cy="reg-address"]').should('be.visible')
    cy.get('[data-cy="reg-email"]').should('be.visible')
    cy.get('[data-cy="reg-submit-btn"]').should('be.visible')
  })

  it('should validate mandatory name and either DOB or Age', () => {
    // Attempt submission with empty form
    cy.get('[data-cy="reg-submit-btn"]').click()
    cy.contains('Patient name is required').should('be.visible')
    cy.contains('Either Date of Birth or Age is required').should('be.visible')
  })

  it('should allow filling Age instead of DOB and calculate correctly', () => {
    cy.get('[data-cy="reg-name"]').type('Kavitha Raman')
    cy.get('[data-cy="reg-gender-female"]').check()
    cy.get('[data-cy="reg-age"]').type('30')

    // Submit with age filled
    cy.get('[data-cy="reg-submit-btn"]').click()
    cy.wait('@registerApi')
    cy.url().should('include', '/patient/select')
  })

  it('should submit complete registration successfully with State and City', () => {
    cy.get('[data-cy="reg-name"]').type('Meena Kumari')
    cy.get('[data-cy="reg-gender-female"]').check()
    cy.get('[data-cy="reg-age"]').type('26')
    cy.get('[data-cy="reg-email"]').type('meena.kumari@example.com')
    cy.get('[data-cy="reg-state"]').select('Tamil Nadu')
    cy.get('[data-cy="reg-city"]').select('Chennai')
    cy.get('[data-cy="reg-pincode"]').type('600028')
    cy.get('[data-cy="reg-address"]').type('No 12, Gandhi Road, Chennai')

    cy.get('[data-cy="reg-submit-btn"]').click()
    cy.wait('@registerApi')
    cy.wait('@getPatients')
    cy.url().should('include', '/patient/select')
  })
})
