/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    noop: () => Cypress.Chainable<JQuery<HTMLElement>>
  }
}
