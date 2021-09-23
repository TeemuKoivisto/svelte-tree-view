const TEST_DATA = `{{}
  "a": [1,2,3],
  "b": {{}
    "c": [[1, 'a'], [2, {{} "d": false }]]
  }
}
`

it('Should render all 3 examples and inputted new data', () => {
  cy.visit('/')
  cy.get('.tree-view').find('li').should('have.length', 270)
  cy.get('[data-test="btn-2"]').click()
  cy.get('.tree-view').find('li').should('have.length', 17)
  cy.get('[data-test="btn-3"]').click()
  cy.get('.tree-view').find('li').should('have.length', 126)
  cy.get('[data-test="input-textarea"]').focus().type(TEST_DATA)
  cy.get('.tree-view').find('li').should('have.length', 19)
})

it('Should collapse first object when clicked', () => {
  cy.visit('/')
  cy.get('.tree-view').find('li').should('have.length', 270)
  cy.get('button.arrow-btn').first().click()
  cy.get('.tree-view').find('li').should('have.length', 226)
})