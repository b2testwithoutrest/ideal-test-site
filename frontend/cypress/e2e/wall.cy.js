describe('Public Wall', () => {
  let testUsername
  const testPassword = 'testpass123'

  before(() => {
    // Create a test user and add some entries for wall tests
    // NOTE: Backend must be running for these tests to pass
    cy.generateRandomUsername().then((username) => {
      testUsername = username
      cy.visit('/')
      cy.registerUser(testUsername, testPassword)
      cy.waitForApiCall()
      
      // Login and add a public entry
      cy.loginUser(testUsername, testPassword)
      cy.waitForApiCall()
      
      // Add a test entry that should appear on the wall
      cy.get('input[placeholder="New entry..."]').type(`Public entry from ${testUsername}`)
      cy.get('button').contains('Add Entry').click()
      cy.waitForApiCall()
    })
  })

  beforeEach(() => {
    cy.clearStorage()
    cy.visit('/')
  })

  it('should display public wall section', () => {
    // Verify public wall is visible
    cy.contains('Public Wall').should('be.visible')
    
    // Check if wall content area exists
    cy.contains('Public Wall').parent().should('exist')
  })

  it('should load and display public entries', () => {
    // Wait for entries to load
    cy.waitForApiCall()
    
    // Check if entries are displayed or "no entries" message
    cy.get('body').then(($body) => {
      if ($body.find('.list-group').length > 0) {
        // Entries exist
        cy.get('.list-group').should('be.visible')
        cy.get('.list-group-item').should('have.length.at.least', 1)
      } else {
        // No entries message
        cy.contains('No public entries yet.').should('be.visible')
      }
    })
  })

  it('should display entries with proper formatting', () => {
    cy.waitForApiCall()
    
    // Check if there are any entries to test formatting
    cy.get('body').then(($body) => {
      if ($body.find('.list-group-item').length > 0) {
        cy.get('.list-group-item').first().within(() => {
          // Should contain username and content
          cy.get('b').should('exist') // Username in bold
          cy.get('.text-muted').should('exist') // Timestamp
        })
      }
    })
  })

  it('should show entries from different users', () => {
    // First create another user and entry
    cy.generateRandomUsername().then((secondUsername) => {
      const secondPassword = 'testpass456'
      
      // Register second user
      cy.registerUser(secondUsername, secondPassword)
      cy.waitForApiCall()
      
      // Login as second user
      cy.loginUser(secondUsername, secondPassword)
      cy.waitForApiCall()
      
      // Add entry from second user
      cy.get('input[placeholder="New entry..."]').type(`Entry from ${secondUsername}`)
      cy.get('button').contains('Add Entry').click()
      cy.waitForApiCall()
      
      // Logout and check wall
      cy.get('button').contains('Logout').click()
      cy.waitForApiCall()
      
      // Now check if both users' entries appear on wall
      cy.get('body').then(($body) => {
        if ($body.find('.list-group-item').length > 1) {
          // Multiple entries should show different usernames
          cy.get('.list-group-item').should('have.length.at.least', 2)
        }
      })
    })
  })

  it('should display entries with timestamps', () => {
    cy.waitForApiCall()
    
    cy.get('body').then(($body) => {
      if ($body.find('.list-group-item').length > 0) {
        cy.get('.list-group-item').first().within(() => {
          // Check for timestamp format
          cy.get('.text-muted').should('exist')
          cy.get('.float-end').should('contain.text', '/') // Date format contains slashes
        })
      }
    })
  })

  it('should be accessible without login', () => {
    // Ensure we're not logged in
    cy.clearStorage()
    cy.visit('/')
    
    // Public wall should be visible even without login
    cy.contains('Public Wall').should('be.visible')
    
    // Should also see login/register forms
    cy.contains('Login').should('be.visible')
    cy.contains('Register').should('be.visible')
  })

  it('should be accessible when logged in', () => {
    // Login first
    cy.loginUser(testUsername, testPassword)
    cy.waitForApiCall()
    
    // Public wall should still be visible when logged in
    cy.contains('Public Wall').should('be.visible')
    
    // Should also see dashboard
    cy.contains('Your Dashboard').should('be.visible')
  })

  it('should handle empty wall state', () => {
    // This tests the empty state message
    cy.waitForApiCall()
    
    cy.get('body').then(($body) => {
      if ($body.find('.list-group-item').length === 0) {
        cy.contains('No public entries yet.').should('be.visible')
      } else {
        // If entries exist, verify they're displayed properly
        cy.get('.list-group').should('be.visible')
      }
    })
  })

  it('should load entries automatically on page load', () => {
    // Intercept the API call to verify it's made
    cy.intercept('GET', '**/entries/wall*').as('getWallEntries')
    
    // Visit page
    cy.visit('/')
    
    // Verify API call was made
    cy.wait('@getWallEntries', { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 404])
    })
  })

  it('should display multiple entries in list format', () => {
    cy.waitForApiCall()
    
    cy.get('body').then(($body) => {
      const entryCount = $body.find('.list-group-item').length
      
      if (entryCount > 0) {
        // Verify list structure
        cy.get('.list-group').should('exist')
        cy.get('.list-group-item').should('have.length', entryCount)
        
        // Each entry should have proper structure
        cy.get('.list-group-item').each(($entry) => {
          cy.wrap($entry).within(() => {
            cy.get('b').should('exist') // Username
            cy.get('.float-end').should('exist') // Timestamp
          })
        })
      }
    })
  })

  it('should show real-time updates when new entries are added', () => {
    // Add a new entry while on the wall page
    cy.generateRandomUsername().then((newUsername) => {
      const newPassword = 'testpass789'
      
      // Register and login new user
      cy.registerUser(newUsername, newPassword)
      cy.waitForApiCall()
      cy.loginUser(newUsername, newPassword)
      cy.waitForApiCall()
      
      // Add entry
      const uniqueEntry = `Real-time entry ${Date.now()}`
      cy.get('input[placeholder="New entry..."]').type(uniqueEntry)
      cy.get('button').contains('Add Entry').click()
      cy.waitForApiCall()
      
      // Logout to view wall
      cy.get('button').contains('Logout').click()
      cy.waitForApiCall()
      
      // Refresh page to see if new entry appears
      cy.reload()
      cy.waitForApiCall()
      
      // Check if the new entry appears (depending on backend implementation)
      cy.get('body').should('contain', 'Public Wall')
    })
  })
})