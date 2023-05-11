/* eslint-disable jest/valid-expect */
/* eslint-disable jest/valid-describe-callback */
/* eslint-disable @typescript-eslint/no-shadow */
import credentials from "../fixtures/credentials";
import { loginFunc } from "../test-helpers/loginFunc";
import setupWebhookTemplates from "../test-helpers/setupWebhookTemplates";
import startWebhookJouney from "../test-helpers/startWebhookJouney";

const { email, password, emailTemplate, userAPIkey } =
  credentials.MessageHitUser;

describe(
  "Journey with webhook triggered",
  { env: { AxiosURL: "http://localhost:3001/" } },
  () => {
    beforeEach(() => {
      cy.request(`${Cypress.env("TESTS_API_BASE_URL")}/api/tests/reset-tests`);
      cy.wait(1000);
    });

    it("passes for GET", () => {
      loginFunc(email, password);
      setupWebhookTemplates();

      startWebhookJouney("webhook1");

      cy.wait(5000);

      cy.request({
        method: "POST",
        url: `${Cypress.env("AxiosURL")}events`,
        headers: {
          Authorization: `Api-Key ${userAPIkey}`,
        },
        body: {
          correlationKey: "email",
          correlationValue: emailTemplate.correlationValue,
          event: { wh: "wh" },
        },
      }).then(() => {
        cy.wait(5000);
        cy.reload();
        cy.get(".justify-between > :nth-child(1) > .font-medium").then((el) => {
          expect(Number(el.text())).greaterThan(0);
        });
      });
    });
  }
);
