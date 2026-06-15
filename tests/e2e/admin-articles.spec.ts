import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@rsw.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";
const TITLE = `E2E Article ${Date.now()}`;

test("admin can create, edit, and delete an article", async ({ page }) => {
  // login
  await page.goto("/admin/login");
  await page.getByPlaceholder("Email").fill(ADMIN_EMAIL);
  await page.getByPlaceholder("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/articles/);

  // create
  await page.getByRole("link", { name: "New Article" }).click();
  await page.getByPlaceholder("Title").fill(TITLE);
  await page.locator(".ProseMirror").click();
  await page.keyboard.type("Hello from the e2e test.");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page).toHaveURL(/\/admin\/articles$/);
  await expect(page.getByText(TITLE)).toBeVisible();

  // edit
  await page.getByRole("row", { name: new RegExp(TITLE) }).getByText("Edit").click();
  await page.getByPlaceholder("Title").fill(`${TITLE} edited`);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(`${TITLE} edited`)).toBeVisible();

  // delete
  await page
    .getByRole("row", { name: new RegExp(`${TITLE} edited`) })
    .getByText("Delete")
    .click();
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText(`${TITLE} edited`)).toHaveCount(0);
});
