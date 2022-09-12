// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    noop: () => Cypress.Chainable<JQuery<HTMLElement>>
  }
}
