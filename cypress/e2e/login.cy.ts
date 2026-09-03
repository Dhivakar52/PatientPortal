describe('Patient Portal - Login & OTP Flow', () => {
  beforeEach(() => {
    cy.setupApiIntercepts()
    cy.visit('/')
  })

  it('should render the login form correctly with hospital branding', () => {
    cy.get('[data-cy="login-mobile"]').should('be.visible')
    cy.get('[data-cy="generate-otp-btn"]').should('be.visible').and('be.disabled')
    cy.contains('SRM Medical College Hospital').should('be.visible')
  })

  it('should validate mobile number input (accepting 10 digits only)', () => {
    // Typing letters should be ignored or sanitized
    cy.get('[data-cy="login-mobile"]').type('abcdef12345')
    cy.get('[data-cy="login-mobile"]').should('have.value', '12345')
    cy.get('[data-cy="generate-otp-btn"]').should('be.disabled')

    // Typing full 10 digits enables the button
    cy.get('[data-cy="login-mobile"]').clear().type('9876543210')
    cy.get('[data-cy="login-mobile"]').should('have.value', '9876543210')
    cy.get('[data-cy="generate-otp-btn"]').should('not.be.disabled')
  })

  it('should handle OTP request and transition to OTP verification screen', () => {
    cy.get('[data-cy="login-mobile"]').type('9876543210')
    cy.get('[data-cy="generate-otp-btn"]').click()

    cy.wait('@getOtp')
    cy.get('[data-cy="otp-input"]').should('be.visible')
    cy.get('[data-cy="verify-otp-btn"]').should('be.visible').and('be.disabled')
    cy.contains('+91 9876543210').should('be.visible')
  })

  it('should allow typing 4-digit OTP and verifying successfully', () => {
    cy.get('[data-cy="login-mobile"]').type('9876543210')
    cy.get('[data-cy="generate-otp-btn"]').click()
    cy.wait('@getOtp')

    // Type 4-digit OTP
    cy.get('[data-cy="otp-input"]').type('1234')
    cy.get('[data-cy="verify-otp-btn"]').should('not.be.disabled').click()

    cy.wait('@loginApi')
    cy.wait('@getPatients')
    cy.url().should('include', '/patient/select')
  })

  it('should show error when invalid OTP is provided', () => {
    cy.intercept('POST', '**/api/login', {
      statusCode: 400,
      body: { message: 'Invalid OTP entered. Please try again.' }
    }).as('loginFail')

    cy.get('[data-cy="login-mobile"]').type('9876543210')
    cy.get('[data-cy="generate-otp-btn"]').click()
    cy.wait('@getOtp')

    cy.get('[data-cy="otp-input"]').type('0000')
    cy.get('[data-cy="verify-otp-btn"]').click()
    cy.wait('@loginFail')

    cy.get('[data-cy="login-otp-error"]').should('be.visible').and('contain', 'Invalid OTP')
  })

  it('should support resending OTP', () => {
    cy.get('[data-cy="login-mobile"]').type('9876543210')
    cy.get('[data-cy="generate-otp-btn"]').click()
    cy.wait('@getOtp')

    cy.get('[data-cy="resend-otp-btn"]').should('be.visible').click()
    cy.wait('@getOtp')
  })
})
