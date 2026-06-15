import { test, expect } from "@playwright/test";

const ARTICLE = "/news/arsenal-edge-past-chelsea";

test("a new user can register and comment; anon is prompted", async ({ page }) => {
  const stamp = Date.now();
  const username = `e2e_${stamp}`;
  const email = `e2e-${stamp}@test.local`;

  // anonymous sees the prompt, not a form
  await page.goto(ARTICLE);
  await expect(page.getByText(/to comment\./)).toBeVisible();

  // register -> auto logged in -> redirected home
  await page.goto("/register");
  await page.getByPlaceholder("Username").fill(username);
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder(/Password/).fill("password123");
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByText(username)).toBeVisible(); // navbar

  // comment on the article
  await page.goto(ARTICLE);
  const text = `Great match ${stamp}`;
  await page.getByPlaceholder("Add a comment…").fill(text);
  await page.getByRole("button", { name: "Comment" }).click();
  await expect(page.getByText(text)).toBeVisible();

  // delete own comment
  await page.getByRole("button", { name: "Delete" }).first().click();
  await expect(page.getByText(text)).toHaveCount(0);
});
