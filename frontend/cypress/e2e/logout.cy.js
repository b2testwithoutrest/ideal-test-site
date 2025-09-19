describe('User Logout', () => {
  let testUsername
  const testPassword = 'testpass123'

  before(() => {
    // Create a test user for logout tests
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
    // Login user before each test
    cy.loginUser(testUsername, testPassword)
    cy.waitForApiCall()
  })

  it('should display logout button when user is logged in', () => {
    // Verify logout button is visible
    cy.get('button').contains('Logout').should('be.visible')
    cy.get('button').contains('Logout').should('have.class', 'btn-outline-danger')
  })

  it('should successfully logout user', () => {
    // Click logout button
    cy.get('button').contains('Logout').click()
    cy.waitForApiCall()
    
    // Should return to login/register page
    cy.contains('Login').should('be.visible')
    cy.contains('Register').should('be.visible')
    
    // Dashboard should no longer be visible
    cy.contains('Your Dashboard').should('not.exist')
    cy.contains('Logout').should('not.exist')
  })

  it('should clear localStorage on logout', () => {
    // Verify token exists before logout
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.not.be.null
      expect(win.localStorage.getItem('user')).to.not.be.null
    })
    
    // Logout
    cy.get('button').contains('Logout').click()
    cy.waitForApiCall()
    
    // Verify token and user data are cleared
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null
      expect(win.localStorage.getItem('user')).to.be.null
    })
  })

  it('should clear session state on logout', () => {
    // Verify user is logged in (dashboard visible)
    cy.contains('Your Dashboard').should('be.visible')
    
    // Logout
    cy.get('button').contains('Logout').click()
    cy.waitForApiCall()
    
    // Verify session is cleared - should see login forms
    cy.contains('Login').should('be.visible')
    cy.contains('Register').should('be.visible')
    cy.contains('Public Wall').should('be.visible')
    
    // Private components should not be visible
    cy.contains('Your Dashboard').should('not.exist')
    cy.contains('Admin Panel').should('not.exist')
  })

  it('should preserve dark mode preference after logout', () => {
    // Toggle to dark mode while logged in
    cy.get('button').contains('Light').click()
    cy.get('body').should('have.class', 'bg-dark')
    
    // Logout
    cy.get('button').contains('Logout').click()
    cy.waitForApiCall()
    
    // Dark mode should still be active
    cy.get('button').should('contain', '🌙 Dark')
    cy.get('body').should('have.class', 'bg-dark')
    cy.get('body').should('have.class', 'text-light')
    
    // Mode preference should remain in localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('mode')).to.equal('dark')
    })
  })

  it('should handle logout with admin user', () => {
    // Logout current user and login as admin
    cy.get('button').contains('Logout').click()
    cy.waitForApiCall()
    
    // Login as admin
    cy.loginUser('admin', 'adminpass')
    cy.waitForApiCall()
    
    // Verify admin panel is visible
    cy.contains('Admin Panel').should('be.visible')
    
    // Logout admin
    cy.get('button').contains('Logout').click()
    cy.waitForApiCall()
    
    // Should return to login page, admin panel should be gone
    cy.contains('Login').should('be.visible')
    cy.contains('Admin Panel').should('not.exist')
    
    // Session should be cleared
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null
      expect(win.localStorage.getItem('user')).to.be.null
    })
  })

  it('should prevent access to protected content after logout', () => {
    // Add an entry while logged in
    const testEntry = `Test entry before logout ${Date.now()}`
    cy.get('input[placeholder="New entry..."]').type(testEntry)
    cy.get('button').contains('Add Entry').click()
    cy.waitForApiCall()
    
    // Verify entry was added
    cy.contains(testEntry).should('be.visible')
    
    // Logout
    cy.get('button').contains('Logout').click()
    cy.waitForApiCall()
    
    // Try to access dashboard functionality by reloading
    cy.reload()
    
    // Should still be on login page, not dashboard
    cy.contains('Login').should('be.visible')
    cy.contains('Your Dashboard').should('not.exist')
    
    // Entry creation form should not be accessible
    cy.get('input[placeholder="New entry..."]').should('not.exist')
  })

  it('should handle logout and immediate re-login', () => {
    // Logout
    cy.get('button').contains('Logout').click()
    cy.waitForApiCall()
    
    // Verify logout completed
    cy.contains('Login').should('be.visible')
    
    // Login again immediately
    cy.loginUser(testUsername, testPassword)
    cy.waitForApiCall()
    
    // Should be back in dashboard
    cy.contains('Your Dashboard').should('be.visible')
    cy.get('button').contains('Logout').should('be.visible')
    
    // Session should be restored
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.not.be.null
      expect(win.localStorage.getItem('user')).to.not.be.null
    })
  })

  it('should maintain public wall access after logout', () => {
    // Logout
    cy.get('button').contains('Logout').click()
    cy.waitForApiCall()
    
    // Public wall should still be accessible
    cy.contains('Public Wall').should('be.visible')
    
    // Should be able to view public content
    cy.waitForApiCall()
    
    // Wall content area should exist
    cy.get('body').then(($body) => {
      if ($body.find('.list-group').length > 0) {
        cy.get('.list-group').should('be.visible')
      } else {
        cy.contains('No public entries yet.').should('be.visible')
      }
    })
  })

  it('should clear UI state properly on logout', () => {
    // Add some content while logged in
    const testEntry = `UI state test ${Date.now()}`
    cy.get('input[placeholder="New entry..."]').type(testEntry)
    cy.get('button').contains('Add Entry').click()
    cy.waitForApiCall()
    
    // Verify content is visible
    cy.contains(testEntry).should('be.visible')
    
    // Logout
    cy.get('button').contains('Logout').click()
    cy.waitForApiCall()
    
    // UI should be completely reset to logged-out state
    cy.contains('Login').should('be.visible')
    cy.contains('Register').should('be.visible')
    cy.contains('Public Wall').should('be.visible')
    
    // Private content should not be visible
    cy.contains('Your Dashboard').should('not.exist')
    cy.contains(testEntry).should('not.exist') // Entry should not be visible in dashboard context
    cy.get('input[placeholder="New entry..."]').should('not.exist')
  })

  it('should handle logout button positioning and styling', () => {
    // Verify logout button styling and position
    cy.get('button').contains('Logout').should('have.class', 'btn-outline-danger')
    cy.get('button').contains('Logout').should('have.class', 'float-end')
    
    // Button should be clickable and properly sized
    cy.get('button').contains('Logout').should('be.visible')
    cy.get('button').contains('Logout').should('not.be.disabled')
  })

  it('should handle page refresh after logout', () => {
    // Logout
    cy.get('button').contains('Logout').click()
    cy.waitForApiCall()
    
    // Refresh page
    cy.reload()
    
    // Should remain logged out
    cy.contains('Login').should('be.visible')
    cy.contains('Register').should('be.visible')
    cy.contains('Your Dashboard').should('not.exist')
    
    // Storage should remain cleared
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null
      expect(win.localStorage.getItem('user')).to.be.null
    })
  })

  it('should handle logout with entries in dashboard', () => {
    // Create multiple entries
    const entries = [`Entry 1 ${Date.now()}`, `Entry 2 ${Date.now()}`, `Entry 3 ${Date.now()}`]
    
    entries.forEach((entry) => {
      cy.get('input[placeholder="New entry..."]').type(entry)
      cy.get('button').contains('Add Entry').click()
      cy.waitForApiCall()
    })
    
    // Verify entries are visible
    entries.forEach((entry) => {
      cy.contains(entry).should('be.visible')
    })
    
    // Logout
    cy.get('button').contains('Logout').click()
    cy.waitForApiCall()
    
    // Should return to login state
    cy.contains('Login').should('be.visible')
    
    // Dashboard entries should not be visible in logged-out context
    cy.contains('Your Dashboard').should('not.exist')
    entries.forEach((entry) => {
      cy.get('body').should('not.contain', entry)
    })
  })
})