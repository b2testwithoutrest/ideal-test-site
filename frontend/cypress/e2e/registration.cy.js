describe('User Registration', () => {
  beforeEach(() => {
    // NOTE: Backend must be running for these tests to pass
    // Start backend with: cd backend && npm start
    cy.clearStorage()
    cy.visit('/')
  })

  it('should successfully register a new user', () => {
    cy.generateRandomUsername().then((username) => {
      const password = 'testpass123'
      
      // Fill registration form
      cy.get('input[placeholder="Username"]').eq(1).type(username)
      cy.get('input[placeholder="Password"]').eq(1).type(password)
      
      // Submit registration
      cy.get('button').contains('Register').click()
      
      // Verify success message
      cy.contains('Registration successful! Please log in.').should('be.visible')
      cy.get('.text-success').should('contain', 'Registration successful')
    })
  })

  it('should show error for duplicate username', () => {
    cy.generateRandomUsername().then((username) => {
      const password = 'testpass123'
      
      // Register first user
      cy.registerUser(username, password)
      cy.waitForApiCall()
      
      // Try to register same username again
      cy.visit('/')
      cy.get('input[placeholder="Username"]').eq(1).type(username)
      cy.get('input[placeholder="Password"]').eq(1).type(password)
      cy.get('button').contains('Register').click()
      
      // Verify error message
      cy.get('.text-danger').should('be.visible')
      cy.get('.text-danger').should('contain.text', 'error')
    })
  })

  it('should show validation error for empty username', () => {
    // Try to submit with empty username
    cy.get('input[placeholder="Password"]').eq(1).type('testpass123')
    cy.get('button').contains('Register').click()
    
    // HTML5 validation should prevent submission
    cy.get('input[placeholder="Username"]').eq(1).should('have.attr', 'required')
    cy.get('input[placeholder="Username"]').eq(1).should(':invalid')
  })

  it('should show validation error for empty password', () => {
    cy.generateRandomUsername().then((username) => {
      // Try to submit with empty password
      cy.get('input[placeholder="Username"]').eq(1).type(username)
      cy.get('button').contains('Register').click()
      
      // HTML5 validation should prevent submission
      cy.get('input[placeholder="Password"]').eq(1).should('have.attr', 'required')
      cy.get('input[placeholder="Password"]').eq(1).should(':invalid')
    })
  })

  it('should show validation error for empty fields', () => {
    // Try to submit with all empty fields
    cy.get('button').contains('Register').click()
    
    // Both fields should be invalid
    cy.get('input[placeholder="Username"]').eq(1).should(':invalid')
    cy.get('input[placeholder="Password"]').eq(1).should(':invalid')
  })

  it('should have proper form structure', () => {
    // Verify form elements exist
    cy.contains('h2', 'Register').should('be.visible')
    cy.get('input[placeholder="Username"]').eq(1).should('be.visible')
    cy.get('input[placeholder="Password"]').eq(1).should('have.attr', 'type', 'password')
    cy.get('button').contains('Register').should('be.visible')
  })
})