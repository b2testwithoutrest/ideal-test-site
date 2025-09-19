describe('Dark Mode Toggle', () => {
  beforeEach(() => {
    // NOTE: Backend must be running for these tests to pass (for full app functionality)
    cy.clearStorage()
    cy.visit('/')
  })

  it('should display dark mode toggle button', () => {
    // Verify dark mode toggle exists and is visible
    cy.get('button').contains('Light').should('be.visible')
    cy.get('button').contains('☀️').should('exist')
  })

  it('should toggle to dark mode when clicked', () => {
    // Initially should be in light mode
    cy.get('button').should('contain', '☀️ Light')
    
    // Click to toggle to dark mode
    cy.get('button').contains('Light').click()
    
    // Should now show dark mode button
    cy.get('button').should('contain', '🌙 Dark')
    
    // Verify body class changes for dark mode
    cy.get('body').should('have.class', 'bg-dark')
    cy.get('body').should('have.class', 'text-light')
  })

  it('should toggle back to light mode when clicked again', () => {
    // First toggle to dark mode
    cy.get('button').contains('Light').click()
    cy.get('button').should('contain', '🌙 Dark')
    
    // Then toggle back to light mode
    cy.get('button').contains('Dark').click()
    cy.get('button').should('contain', '☀️ Light')
    
    // Verify body classes are removed
    cy.get('body').should('not.have.class', 'bg-dark')
    cy.get('body').should('not.have.class', 'text-light')
  })

  it('should persist dark mode preference in localStorage', () => {
    // Toggle to dark mode
    cy.get('button').contains('Light').click()
    
    // Check localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('mode')).to.equal('dark')
    })
    
    // Toggle back to light mode
    cy.get('button').contains('Dark').click()
    
    // Check localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('mode')).to.equal('light')
    })
  })

  it('should remember dark mode preference on page reload', () => {
    // Toggle to dark mode
    cy.get('button').contains('Light').click()
    cy.get('button').should('contain', '🌙 Dark')
    
    // Reload page
    cy.reload()
    
    // Should still be in dark mode
    cy.get('button').should('contain', '🌙 Dark')
    cy.get('body').should('have.class', 'bg-dark')
    cy.get('body').should('have.class', 'text-light')
  })

  it('should remember light mode preference on page reload', () => {
    // Start in light mode (default)
    cy.get('button').should('contain', '☀️ Light')
    
    // Reload page
    cy.reload()
    
    // Should still be in light mode
    cy.get('button').should('contain', '☀️ Light')
    cy.get('body').should('not.have.class', 'bg-dark')
    cy.get('body').should('not.have.class', 'text-light')
  })

  it('should apply visual changes in dark mode', () => {
    // Check initial light mode styles
    cy.get('body').should('not.have.class', 'bg-dark')
    
    // Toggle to dark mode
    cy.get('button').contains('Light').click()
    
    // Verify dark mode visual changes
    cy.get('body').should('have.class', 'bg-dark')
    cy.get('body').should('have.class', 'text-light')
    
    // Verify button style changes (Bootstrap dark mode)
    cy.get('button').contains('Dark').should('be.visible')
  })

  it('should work consistently across different pages/states', () => {
    // Test dark mode with login form visible
    cy.get('button').contains('Light').click()
    cy.get('body').should('have.class', 'bg-dark')
    
    // Elements should still be visible in dark mode
    cy.contains('Login').should('be.visible')
    cy.contains('Register').should('be.visible')
    cy.contains('Public Wall').should('be.visible')
    
    // Toggle back to light mode
    cy.get('button').contains('Dark').click()
    cy.get('body').should('not.have.class', 'bg-dark')
  })

  it('should maintain dark mode when user logs in', () => {
    // Create a test user first
    cy.generateRandomUsername().then((username) => {
      const password = 'testpass123'
      
      // Register user
      cy.registerUser(username, password)
      cy.waitForApiCall()
      
      // Toggle to dark mode before login
      cy.get('button').contains('Light').click()
      cy.get('body').should('have.class', 'bg-dark')
      
      // Login
      cy.loginUser(username, password)
      cy.waitForApiCall()
      
      // Should still be in dark mode after login
      cy.get('button').should('contain', '🌙 Dark')
      cy.get('body').should('have.class', 'bg-dark')
      cy.get('body').should('have.class', 'text-light')
      
      // Dashboard should be visible in dark mode
      cy.contains('Your Dashboard').should('be.visible')
    })
  })

  it('should maintain dark mode when user logs out', () => {
    // Create and login user
    cy.generateRandomUsername().then((username) => {
      const password = 'testpass123'
      
      cy.registerUser(username, password)
      cy.waitForApiCall()
      cy.loginUser(username, password)
      cy.waitForApiCall()
      
      // Toggle to dark mode while logged in
      cy.get('button').contains('Light').click()
      cy.get('body').should('have.class', 'bg-dark')
      
      // Logout
      cy.get('button').contains('Logout').click()
      cy.waitForApiCall()
      
      // Should still be in dark mode after logout
      cy.get('button').should('contain', '🌙 Dark')
      cy.get('body').should('have.class', 'bg-dark')
      cy.get('body').should('have.class', 'text-light')
      
      // Login/Register forms should be visible in dark mode
      cy.contains('Login').should('be.visible')
      cy.contains('Register').should('be.visible')
    })
  })

  it('should have proper button positioning and styling', () => {
    // Check button positioning (should be in top-right area)
    cy.get('button').contains('Light').parent().should('have.class', 'text-end')
    cy.get('button').contains('Light').parent().should('have.class', 'mb-2')
    
    // Check button styling
    cy.get('button').contains('Light').should('have.class', 'btn-outline-secondary')
  })

  it('should toggle multiple times without issues', () => {
    // Test rapid toggling
    for (let i = 0; i < 5; i++) {
      if (i % 2 === 0) {
        // Toggle to dark
        cy.get('button').contains('Light').click()
        cy.get('button').should('contain', '🌙 Dark')
        cy.get('body').should('have.class', 'bg-dark')
      } else {
        // Toggle to light
        cy.get('button').contains('Dark').click()
        cy.get('button').should('contain', '☀️ Light')
        cy.get('body').should('not.have.class', 'bg-dark')
      }
    }
  })

  it('should handle initial state correctly', () => {
    // On fresh visit, should default to light mode
    cy.window().then((win) => {
      // Clear any existing mode preference
      win.localStorage.removeItem('mode')
    })
    
    cy.reload()
    
    // Should default to light mode
    cy.get('button').should('contain', '☀️ Light')
    cy.get('body').should('not.have.class', 'bg-dark')
    
    // localStorage should now have light mode set
    cy.window().then((win) => {
      expect(win.localStorage.getItem('mode')).to.equal('light')
    })
  })

  it('should have accessible button text and icons', () => {
    // Light mode button
    cy.get('button').contains('☀️ Light').should('be.visible')
    
    // Toggle to dark mode
    cy.get('button').contains('Light').click()
    
    // Dark mode button
    cy.get('button').contains('🌙 Dark').should('be.visible')
    
    // Icons should be properly displayed
    cy.get('button').should('contain', '🌙')
    
    // Toggle back
    cy.get('button').contains('Dark').click()
    cy.get('button').should('contain', '☀️')
  })
})