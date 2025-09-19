describe('Admin Panel', () => {
  let regularUsername
  const regularPassword = 'testpass123'
  const adminUsername = 'admin'
  const adminPassword = 'adminpass'

  before(() => {
    // Create a regular test user for admin tests
    // NOTE: Backend must be running for these tests to pass
    // NOTE: Default admin user should exist (username: admin, password: adminpass)
    cy.generateRandomUsername().then((username) => {
      regularUsername = username
      cy.visit('/')
      cy.registerUser(regularUsername, regularPassword)
      cy.waitForApiCall()
    })
  })

  beforeEach(() => {
    cy.clearStorage()
    cy.visit('/')
  })

  describe('Admin Access', () => {
    it('should display admin panel for admin users', () => {
      // Login as admin
      cy.loginUser(adminUsername, adminPassword)
      cy.waitForApiCall()
      
      // Verify admin panel is visible
      cy.contains('Admin Panel').should('be.visible')
      
      // Verify admin panel elements
      cy.contains('Users:').should('be.visible')
      cy.contains('Entries:').should('be.visible')
      cy.get('.list-group').should('exist') // User list
    })

    it('should show admin stats (users and entries count)', () => {
      // Login as admin
      cy.loginUser(adminUsername, adminPassword)
      cy.waitForApiCall()
      
      // Wait for stats to load
      cy.waitForApiCall()
      
      // Verify stats are displayed
      cy.contains('Users:').should('be.visible')
      cy.contains('Entries:').should('be.visible')
      
      // Stats should contain numbers
      cy.get('div').contains('Users:').should('match', /Users: \d+/)
      cy.get('div').contains('Entries:').should('match', /Entries: \d+/)
    })

    it('should display list of users', () => {
      // Login as admin
      cy.loginUser(adminUsername, adminPassword)
      cy.waitForApiCall()
      
      // Wait for users to load
      cy.waitForApiCall()
      
      // Verify user list exists
      cy.get('.list-group').should('be.visible')
      cy.get('.list-group-item').should('have.length.at.least', 1)
      
      // Should show admin user
      cy.get('.list-group-item').should('contain', 'admin')
      cy.get('.list-group-item').should('contain', '(admin)')
    })

    it('should be able to delete non-admin users', () => {
      // Login as admin
      cy.loginUser(adminUsername, adminPassword)
      cy.waitForApiCall()
      
      // Wait for users to load
      cy.waitForApiCall()
      
      // Find regular user in the list
      cy.get('.list-group-item').contains(regularUsername).parent().within(() => {
        // Verify delete button exists for non-admin user
        cy.get('button').contains('Delete').should('exist')
        
        // Click delete button
        cy.get('button').contains('Delete').click()
      })
      
      // Wait for deletion to complete
      cy.waitForApiCall()
      
      // Verify user is removed from list
      cy.get('.list-group-item').should('not.contain', regularUsername)
    })

    it('should not show delete button for admin users', () => {
      // Login as admin
      cy.loginUser(adminUsername, adminPassword)
      cy.waitForApiCall()
      
      // Wait for users to load
      cy.waitForApiCall()
      
      // Find admin user in the list
      cy.get('.list-group-item').contains('admin').parent().within(() => {
        // Verify no delete button for admin
        cy.get('button').contains('Delete').should('not.exist')
      })
    })

    it('should update stats after user deletion', () => {
      let initialUserCount
      
      // Login as admin
      cy.loginUser(adminUsername, adminPassword)
      cy.waitForApiCall()
      
      // Get initial user count
      cy.get('div').contains('Users:').invoke('text').then((text) => {
        initialUserCount = parseInt(text.match(/Users: (\d+)/)[1])
      })
      
      // Create and then delete a user to test stats update
      cy.generateRandomUsername().then((tempUsername) => {
        // First logout and create a temporary user
        cy.get('button').contains('Logout').click()
        cy.waitForApiCall()
        
        cy.registerUser(tempUsername, 'temppass123')
        cy.waitForApiCall()
        
        // Login back as admin
        cy.loginUser(adminUsername, adminPassword)
        cy.waitForApiCall()
        
        // Verify user count increased
        cy.get('div').contains('Users:').should('contain', `Users: ${initialUserCount + 1}`)
        
        // Delete the temporary user
        cy.get('.list-group-item').contains(tempUsername).parent().within(() => {
          cy.get('button').contains('Delete').click()
        })
        
        cy.waitForApiCall()
        
        // Verify user count decreased
        cy.get('div').contains('Users:').should('contain', `Users: ${initialUserCount}`)
      })
    })
  })

  describe('Non-Admin Access Control', () => {
    it('should not display admin panel for regular users', () => {
      // Login as regular user
      cy.loginUser(regularUsername, regularPassword)
      cy.waitForApiCall()
      
      // Verify admin panel is NOT visible
      cy.contains('Admin Panel').should('not.exist')
      
      // Should see regular user dashboard
      cy.contains('Your Dashboard').should('be.visible')
      cy.contains('Public Wall').should('be.visible')
    })

    it('should not show admin panel for logged out users', () => {
      // Make sure we're logged out
      cy.clearStorage()
      cy.visit('/')
      
      // Verify admin panel is NOT visible
      cy.contains('Admin Panel').should('not.exist')
      
      // Should see login/register forms
      cy.contains('Login').should('be.visible')
      cy.contains('Register').should('be.visible')
    })

    it('should prevent direct access to admin features via API', () => {
      // Login as regular user
      cy.loginUser(regularUsername, regularPassword)
      cy.waitForApiCall()
      
      // Try to make direct admin API calls (this tests backend security)
      cy.window().then((win) => {
        const token = win.localStorage.getItem('token')
        
        // Try to access admin users endpoint
        cy.request({
          method: 'GET',
          url: 'https://ideal-test-site.onrender.com/api/admin/users',
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false
        }).then((response) => {
          // Should get unauthorized or forbidden response
          expect([401, 403, 404]).to.include(response.status)
        })
      })
    })
  })

  describe('Admin Panel Functionality', () => {
    beforeEach(() => {
      // Login as admin for these tests
      cy.loginUser(adminUsername, adminPassword)
      cy.waitForApiCall()
    })

    it('should load admin data on page load', () => {
      // Intercept admin API calls
      cy.intercept('GET', '**/admin/users*').as('getUsers')
      cy.intercept('GET', '**/admin/stats*').as('getStats')
      
      // Reload page to trigger API calls
      cy.reload()
      
      // Verify API calls were made
      cy.wait('@getUsers', { timeout: 10000 })
      cy.wait('@getStats', { timeout: 10000 })
    })

    it('should handle empty user list gracefully', () => {
      // This test verifies the admin panel handles edge cases
      cy.get('.list-group').should('exist')
      
      // Even if list is empty, structure should be intact
      cy.contains('Admin Panel').should('be.visible')
      cy.contains('Users:').should('be.visible')
      cy.contains('Entries:').should('be.visible')
    })

    it('should display user information correctly', () => {
      // Wait for users to load
      cy.waitForApiCall()
      
      // Check each user item has proper format
      cy.get('.list-group-item').each(($item) => {
        cy.wrap($item).within(() => {
          // Should have username
          cy.get('span').should('exist')
          
          // Check if it's an admin user
          cy.get('span').then(($span) => {
            if ($span.text().includes('(admin)')) {
              // Admin users should not have delete button
              cy.get('button').contains('Delete').should('not.exist')
            } else {
              // Regular users should have delete button
              cy.get('button').contains('Delete').should('exist')
            }
          })
        })
      })
    })

    it('should refresh data after user operations', () => {
      // Create a user to test refresh functionality
      cy.generateRandomUsername().then((testUser) => {
        // Logout and create user
        cy.get('button').contains('Logout').click()
        cy.waitForApiCall()
        
        cy.registerUser(testUser, 'testpass123')
        cy.waitForApiCall()
        
        // Login back as admin
        cy.loginUser(adminUsername, adminPassword)
        cy.waitForApiCall()
        
        // User should appear in list
        cy.contains(testUser).should('be.visible')
        
        // Delete user and verify list updates
        cy.get('.list-group-item').contains(testUser).parent().within(() => {
          cy.get('button').contains('Delete').click()
        })
        
        cy.waitForApiCall()
        
        // User should be removed from list
        cy.contains(testUser).should('not.exist')
      })
    })
  })
})