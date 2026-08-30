import { expect, test } from "@playwright/test";

test("OGE social studies trainer starts", async ({ page }) => {
  await page.goto("http://127.0.0.1:3000/social-studies/oge");
  await expect(page.getByRole("heading", { name: "Выберите формат тренировки" })).toBeVisible();
  await page.getByRole("button", { name: "Начать" }).first().click();
  await expect(page.getByText(/Задание 1 из/)).toBeVisible();
  await expect(page.locator(".trainer-question-card").getByText(/Какие два из перечисленных понятий/)).toBeVisible();
});

test("EGE social studies trainer starts", async ({ page }) => {
  await page.goto("http://127.0.0.1:3000/social-studies/ege");
  await expect(page.getByRole("heading", { name: "Выберите формат тренировки" })).toBeVisible();
  await page.getByRole("button", { name: "Начать" }).first().click();
  await expect(page.getByText(/Задание 1 из/)).toBeVisible();
  await expect(page.locator(".trainer-question-card").getByText(/Задание ЕГЭ №/)).toBeVisible();
  await expect(page.locator(".trainer-question-card").getByLabel("Ответ")).toBeVisible();
});
