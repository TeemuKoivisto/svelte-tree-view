describe('# Site', () => {
  it('Should render', () => {
    cy.visit('/')
    cy.get('h1').should('contain.text', 'svelte-tree-view')
  })
})
