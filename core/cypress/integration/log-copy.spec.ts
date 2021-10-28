import item1 from '../fixtures/example-1-item-1.json'

it('Should show functioning log & copy buttons', () => {
  cy.visit('/', {
    onBeforeLoad(win) {
      cy.stub(win.console, 'log').as('consoleLog')
      cy.stub(win.console, 'info').as('consoleInfo')
      cy.stub(win.console, 'error').as('consoleError')
      cy.stub(win.navigator.clipboard, 'writeText').as('write')
    }
  })
  cy.get('#showLogButton').click()
  cy.get('#showCopyButton').click()
  cy.get('.log-copy-button').should('have.length', 468)
  cy.get('.log-copy-button').eq(1).click()
  cy.get('@write').should('be.calledWith', JSON.stringify(item1))
  cy.get('.log-copy-button').eq(0).click()
  cy.get('@consoleInfo').should('be.calledWith', '%c [svelte-tree-view]: Property added to window._node')
  cy.get('@consoleLog').should('be.calledWith', item1)
  cy.get('@consoleError').should('be.callCount', 0)
})