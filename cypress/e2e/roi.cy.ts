/// <reference types="cypress" />

describe("roi trace selection", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("initial display", () => {
    cy.title().should("eq", "ROI Trace Selection");

    cy.get("#appTitle").should("contain.text", "ROI Trace Selection");
    cy.get("#appTitle").should("contain.text", "[No file]");

    cy.get("#unselectedRoiCount").should("have.text", "0");
    cy.get("#unscannedRoiCount").should("have.text", "0");
    cy.get("#selectedRoiCount").should("have.text", "0");
    cy.get("button#remainingCount").should("have.text", "0 Remaining");

    cy.get("#roiChoiceList label").should("have.length", 0);
  });

  it("initial example data display", () => {
    cy.get("button#openChannel1Test").click();

    cy.title().should("eq", "ROI Trace Selection");

    cy.get("#appTitle").should("contain.text", "ROI Trace Selection");
    cy.get("#appTitle").should("contain.text", "Example data");

    cy.get("#unselectedRoiCount").should("have.text", "0");
    cy.get("#unscannedRoiCount").should("have.text", "65");
    cy.get("#selectedRoiCount").should("have.text", "0");
    cy.get("button#remainingCount").should("have.text", "65 Remaining");

    cy.get("#roiChoiceList label").should("have.length", 65);
  });
});
