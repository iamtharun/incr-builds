/// <reference types="cypress" />

describe('health-department contact cases case-list', () => {
  beforeEach(() => {
    cy.server();
    cy.route('GET', '/hd/cases').as('allCases');

    cy.loginAgent();
  });

  it('should be display cases and allow to edit single case', () => {
    cy.location('pathname').should('eq', '/health-department/index-cases/case-list');

    cy.get('[data-cy="contact-cases"]').click();

    cy.location('pathname').should('eq', '/health-department/contact-cases/case-list');

    cy.get('[data-cy="new-case-button"]').should('exist');
    cy.get('[data-cy="search-case-input"]').should('exist');
    cy.get('[data-cy="case-data-table"]').should('exist');

    cy.wait('@allCases').its('status').should('eq', 200);

    cy.get('[data-cy="case-data-table"]')
      .find('.ag-center-cols-container > .ag-row')
      .should('have.length.greaterThan', 0);

    cy.get('[data-cy="search-case-input"]').type('Baum');
    cy.get('[data-cy="case-data-table"]').find('.ag-center-cols-container > .ag-row').should('have.length', 1);

    cy.get('[data-cy="search-case-input"]').clear();

    cy.get('[data-cy="case-data-table"]')
      .find('.ag-center-cols-container > .ag-row')
      .then(($elems) => {
        $elems[1].click();
      });
    cy.location('pathname').should('include', '/edit');
  });
});
