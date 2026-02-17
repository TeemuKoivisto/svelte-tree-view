it('DnD: drag n1-c1 into n2-c1 (demonstrates broken UI)', () => {
  cy.visit('/dnd')
  // Wait for tree to render
  cy.get('[data-tree-node-id]', { timeout: 10000 }).should('exist')
  cy.wait(500) // Allow SvelteKit/dnd setup

  // n1-c1 has data-dnd-id="[0,2,0]", n2-c1 has data-dnd-id="[1,2,0]"
  const sourceSelector = '[data-dnd-id="[0,2,0]"]'
  const targetSelector = '[data-dnd-id="[1,2,0]"]'

  cy.get(sourceSelector).should('exist')
  cy.get(targetSelector).should('exist')

  // Verify initial state: n2-c1 should have 2 children (n2-c1-gc1, n2-c1-gc2)
  cy.get(targetSelector)
    .closest('.tree-node-container')
    .find('> .children-container > .tree-node-container')
    .should('have.length', 2)

  // Get source element (n1-c1)
  cy.get(sourceSelector).as('source')

  // Get target element (n2-c1)
  cy.get(targetSelector).as('target')

  // Simulate drag from n1-c1 to n2-c1 using pointer events
  cy.get('@source').then($source => {
    const sourceRect = $source[0].getBoundingClientRect()
    const startX = sourceRect.left + sourceRect.width / 2
    const startY = sourceRect.top + sourceRect.height / 2

    cy.get('@target').then($target => {
      const targetRect = $target[0].getBoundingClientRect()
      const endX = targetRect.left + targetRect.width / 2
      const endY = targetRect.top + targetRect.height / 2

      // Trigger drag sequence
      cy.get('@source').trigger('pointerdown', {
        button: 0,
        clientX: startX,
        clientY: startY,
        force: true,
        pointerId: 1
      })

      // Move to target - pragmatic-drag-and-drop listens on document
      cy.document().trigger('pointermove', {
        clientX: endX,
        clientY: endY,
        force: true,
        pointerId: 1
      })

      cy.get('@target').trigger('pointermove', {
        clientX: endX,
        clientY: endY,
        force: true,
        pointerId: 1
      })

      cy.get('@target').trigger('pointerup', {
        button: 0,
        clientX: endX,
        clientY: endY,
        force: true,
        pointerId: 1
      })
    })
  })

  // After drop, n2-c1 should now have 3 children (n1-c1 was moved in)
  // Note: node IDs change after move (they're path-based), so we check child count
  cy.get(targetSelector)
    .closest('.tree-node-container')
    .find('> .children-container > .tree-node-container')
    .should('have.length', 3)
})
