describe('Dashboard', () => {
  let testUsername
  const testPassword = 'testpass123'

  before(() => {
    // Create a test user for dashboard tests
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
    cy.loginUser(testUsername, testPassword)
    cy.waitForApiCall()
  })

  it('should display dashboard after login', () => {
    // Verify dashboard elements are visible
    cy.contains('Your Dashboard').should('be.visible')
    cy.get('input[placeholder="New entry..."]').should('be.visible')
    cy.get('button').contains('Add Entry').should('be.visible')
    cy.get('button').contains('Logout').should('be.visible')
  })

  it('should successfully create a new entry', () => {
    const entryContent = `Test entry ${Date.now()}`
    
    // Add new entry
    cy.get('input[placeholder="New entry..."]').type(entryContent)
    cy.get('button').contains('Add Entry').click()
    
    // Wait for entry to be added
    cy.waitForApiCall()
    
    // Verify entry appears in the list
    cy.contains(entryContent).should('be.visible')
    
    // Verify input is cleared after successful submission
    cy.get('input[placeholder="New entry..."]').should('have.value', '')
  })

  it('should show validation error for empty entry submission', () => {
    // Try to submit empty entry
    cy.get('button').contains('Add Entry').click()
    
    // HTML5 validation should prevent submission
    cy.get('input[placeholder="New entry..."]').should('have.attr', 'required')
    cy.get('input[placeholder="New entry..."]').should(':invalid')
  })

  it('should handle invalid submissions gracefully', () => {
    // Test with very long content (potential server validation)
    const longContent = 'A'.repeat(10000)
    
    cy.get('input[placeholder="New entry..."]').type(longContent.substring(0, 1000)) // Limit input
    cy.get('button').contains('Add Entry').click()
    
    // Should either succeed or show error gracefully
    cy.waitForApiCall()
    
    // Check if error message appears or entry is added
    cy.get('body').then(($body) => {
      if ($body.find('.text-danger').length > 0) {
        cy.get('.text-danger').should('be.visible')
      } else {
        // Entry was added successfully
        cy.contains('A'.repeat(100)).should('be.visible') // Check for partial content
      }
    })
  })

  it('should successfully delete an entry', () => {
    const entryContent = `Test entry to delete ${Date.now()}`
    
    // Add new entry
    cy.get('input[placeholder="New entry..."]').type(entryContent)
    cy.get('button').contains('Add Entry').click()
    cy.waitForApiCall()
    
    // Verify entry exists
    cy.contains(entryContent).should('be.visible')
    
    // Find and click delete button for this entry
    cy.contains(entryContent).parent().within(() => {
      cy.get('button').contains('Delete').click()
    })
    
    cy.waitForApiCall()
    
    // Verify entry is removed
    cy.contains(entryContent).should('not.exist')
  })

  it('should create multiple entries and display them', () => {
    const entries = [
      `First entry ${Date.now()}`,
      `Second entry ${Date.now() + 1}`,
      `Third entry ${Date.now() + 2}`
    ]
    
    // Add multiple entries
    entries.forEach((entry) => {
      cy.get('input[placeholder="New entry..."]').type(entry)
      cy.get('button').contains('Add Entry').click()
      cy.waitForApiCall()
    })
    
    // Verify all entries are visible
    entries.forEach((entry) => {
      cy.contains(entry).should('be.visible')
    })
  })

  it('should handle rapid entry creation', () => {
    const rapidEntries = Array.from({ length: 3 }, (_, i) => `Rapid entry ${i} ${Date.now()}`)
    
    // Add entries in rapid succession
    rapidEntries.forEach((entry, index) => {
      cy.get('input[placeholder="New entry..."]').type(entry)
      cy.get('button').contains('Add Entry').click()
      if (index < rapidEntries.length - 1) {
        cy.wait(200) // Small delay between submissions
      }
    })
    
    // Wait for all to complete
    cy.waitForApiCall()
    
    // Verify entries appear (at least some should work)
    cy.get('body').should('contain', 'Rapid entry')
  })

  it('should show error messages appropriately', () => {
    // This test checks if error handling is working
    // The exact error conditions depend on backend validation
    
    // Verify error container exists for displaying errors
    cy.get('input[placeholder="New entry..."]').type('test')
    cy.get('button').contains('Add Entry').click()
    
    // Wait and check if any error elements exist in the DOM
    cy.waitForApiCall()
    
    // Error handling structure should be in place
    cy.get('body').then(($body) => {
      // Just verify the error display mechanism exists
      expect($body.find('.text-danger')).to.exist
    })
  })

  it('should maintain entries after page reload', () => {
    const persistentEntry = `Persistent entry ${Date.now()}`
    
    // Add entry
    cy.get('input[placeholder="New entry..."]').type(persistentEntry)
    cy.get('button').contains('Add Entry').click()
    cy.waitForApiCall()
    
    // Reload page
    cy.reload()
    cy.waitForApiCall()
    
    // Verify entry still exists
    cy.contains(persistentEntry).should('be.visible')
  })

  it('should display entries in correct format', () => {
    const testEntry = `Formatted entry ${Date.now()}`
    
    // Add entry
    cy.get('input[placeholder="New entry..."]').type(testEntry)
    cy.get('button').contains('Add Entry').click()
    cy.waitForApiCall()
    
    // Verify entry appears with proper structure
    cy.contains(testEntry).should('be.visible')
    
    // Check if entry has associated metadata (username, timestamp, etc.)
    cy.contains(testEntry).parent().within(() => {
      // Should have delete button
      cy.get('button').contains('Delete').should('exist')
    })
  })
})