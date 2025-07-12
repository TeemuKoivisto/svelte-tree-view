// NOTE: the weird brackets {} are due to Cypress typing parsing
const TEST_DATA = `{{}
  "a": [1,2,3],
  "b": {{}
    "c": [[1, 'a'], [2, {{} "d": false }]]
  }
}
`

describe('# UI', () => {
  it('Should render all 4 examples and inputted new data', () => {
    cy.visit('/')
    cy.get('.svelte-tree-view').find('li').should('have.length', 270)
    cy.wait(2000)
    cy.get('a').contains('(2) Diff').click()
    cy.get('.svelte-tree-view').find('li').should('have.length', 17)
    cy.get('a').contains('(3) Circular').click()
    cy.get('.svelte-tree-view').find('li').should('have.length', 126)
    cy.get('a').contains('(4) Tailwind').click()
    cy.get('.svelte-tree-view').find('div[data-tree-id]').should('have.length', 130)
    cy.get('a').contains('(1) Basic').click()
    cy.get('[data-test-id="input-textarea"]').focus().type(TEST_DATA)
    cy.get('.svelte-tree-view').find('li').should('have.length', 19)
  })

  it('Should collapse first object when clicked', () => {
    cy.visit('/')
    cy.get('.svelte-tree-view').wait(2000).find('li').should('have.length', 270)
    cy.get('button.arrow-btn').first().click()
    cy.get('.svelte-tree-view').find('li').should('have.length', 226)
  })
})
