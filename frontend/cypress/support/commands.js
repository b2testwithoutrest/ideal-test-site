// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to generate a random username
Cypress.Commands.add('generateRandomUsername', () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `testuser_${timestamp}_${random}`
})

// Custom command to clean up localStorage
Cypress.Commands.add('clearStorage', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
    win.sessionStorage.clear()
  })
})

// Custom command to login programmatically (for setup)
Cypress.Commands.add('loginUser', (username, password) => {
  cy.visit('/')
  cy.get('input[placeholder="Username"]').eq(0).type(username)
  cy.get('input[placeholder="Password"]').eq(0).type(password)
  cy.get('button').contains('Login').click()
})

// Custom command to register a new user
Cypress.Commands.add('registerUser', (username, password) => {
  cy.visit('/')
  cy.get('input[placeholder="Username"]').eq(1).type(username)
  cy.get('input[placeholder="Password"]').eq(1).type(password)
  cy.get('button').contains('Register').click()
})

// Custom command to wait for API calls to complete
Cypress.Commands.add('waitForApiCall', () => {
  cy.wait(500) // Simple wait, could be enhanced with intercepts
})