// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="cypress" />

declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    openModal: (nth?: number) => void
  }
}
