describe('User Login', () => {
  let testUsername
  const testPassword = 'testpass123'

  before(() => {
    // Create a test user for login tests
    // NOTE: Backend must be running for these tests to pass
    cy.generateRandomUsername().then((username) => {
      testUsername = username
      cy.visit('/')
      cy.registerUser(testUsername, testPassword)
      cy.waitForApiCall()
    })
  })

  beforeEach(() => {
    cy.clearStorage()
    cy.visit('/')
  })

  it('should successfully login with correct credentials', () => {
    // Fill login form
    cy.get('input[placeholder="Username"]').eq(0).type(testUsername)
    cy.get('input[placeholder="Password"]').eq(0).type(testPassword)
    
    // Submit login
    cy.get('button').contains('Login').click()
    
    // Verify successful login - should see dashboard
    cy.contains('Your Dashboard').should('be.visible')
    cy.contains('Logout').should('be.visible')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should fail login with incorrect password', () => {
    // Fill login form with wrong password
    cy.get('input[placeholder="Username"]').eq(0).type(testUsername)
    cy.get('input[placeholder="Password"]').eq(0).type('wrongpassword')
    
    // Submit login
    cy.get('button').contains('Login').click()
    
    // Verify error message
    cy.get('.text-danger').should('be.visible')
    cy.get('.text-danger').should('contain.text', 'failed')
    
    // Should still be on login page
    cy.contains('Login').should('be.visible')
    cy.contains('Register').should('be.visible')
  })

  it('should fail login with non-existent username', () => {
    cy.generateRandomUsername().then((nonExistentUser) => {
      // Fill login form with non-existent user
      cy.get('input[placeholder="Username"]').eq(0).type(nonExistentUser)
      cy.get('input[placeholder="Password"]').eq(0).type(testPassword)
      
      // Submit login
      cy.get('button').contains('Login').click()
      
      // Verify error message
      cy.get('.text-danger').should('be.visible')
      
      // Should still be on login page
      cy.contains('Login').should('be.visible')
    })
  })

  it('should show validation error for empty username', () => {
    // Try to submit with empty username
    cy.get('input[placeholder="Password"]').eq(0).type(testPassword)
    cy.get('button').contains('Login').click()
    
    // HTML5 validation should prevent submission
    cy.get('input[placeholder="Username"]').eq(0).should('have.attr', 'required')
    cy.get('input[placeholder="Username"]').eq(0).should(':invalid')
  })

  it('should show validation error for empty password', () => {
    // Try to submit with empty password
    cy.get('input[placeholder="Username"]').eq(0).type(testUsername)
    cy.get('button').contains('Login').click()
    
    // HTML5 validation should prevent submission
    cy.get('input[placeholder="Password"]').eq(0).should('have.attr', 'required')
    cy.get('input[placeholder="Password"]').eq(0).should(':invalid')
  })

  it('should show validation error for empty fields', () => {
    // Try to submit with all empty fields
    cy.get('button').contains('Login').click()
    
    // Both fields should be invalid
    cy.get('input[placeholder="Username"]').eq(0).should(':invalid')
    cy.get('input[placeholder="Password"]').eq(0).should(':invalid')
  })

  it('should have remember me checkbox functionality', () => {
    // Verify remember me checkbox exists
    cy.get('#remember').should('exist')
    cy.get('label[for="remember"]').should('contain', 'Remember me')
    
    // Test checking the checkbox
    cy.get('#remember').check()
    cy.get('#remember').should('be.checked')
    
    // Test unchecking the checkbox
    cy.get('#remember').uncheck()
    cy.get('#remember').should('not.be.checked')
  })

  it('should have proper form structure', () => {
    // Verify form elements exist
    cy.contains('h2', 'Login').should('be.visible')
    cy.get('input[placeholder="Username"]').eq(0).should('be.visible')
    cy.get('input[placeholder="Password"]').eq(0).should('have.attr', 'type', 'password')
    cy.get('#remember').should('exist')
    cy.get('button').contains('Login').should('be.visible')
  })

  it('should remember login when remember me is checked', () => {
    // Login with remember me checked
    cy.get('input[placeholder="Username"]').eq(0).type(testUsername)
    cy.get('input[placeholder="Password"]').eq(0).type(testPassword)
    cy.get('#remember').check()
    cy.get('button').contains('Login').click()
    
    // Verify successful login
    cy.contains('Your Dashboard').should('be.visible')
    
    // Check if token is stored in localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.not.be.null
    })
  })
})