const TEST_DATA = `{{}
  "a": [1,2,3],
  "b": {{}
    "c": [[1, 'a'], [2, {{} "d": false }]]
  }
}
`

describe('# UI', () => {
  it('Should render all 3 examples and inputted new data', () => {
    cy.visit('/')
    cy.get('.svelte-tree-view').find('li').should('have.length', 270)
    cy.get('button').wait(2000).contains('Example 2').click()
    cy.get('.svelte-tree-view').find('li').should('have.length', 17)
    cy.get('button').contains('Example 3').click()
    cy.get('.svelte-tree-view').find('li').should('have.length', 126)
    cy.get('[data-test="input-textarea"]').focus().type(TEST_DATA)
    cy.get('.svelte-tree-view').find('li').should('have.length', 19)
  })

  it('Should collapse first object when clicked', () => {
    cy.visit('/')
    cy.get('.svelte-tree-view').wait(2000).find('li').should('have.length', 270)
    cy.get('button.arrow-btn').first().click()
    cy.get('.svelte-tree-view').find('li').should('have.length', 226)
  })
})
