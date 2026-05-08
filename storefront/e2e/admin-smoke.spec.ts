import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('Admin can login and view products', async ({ page }) => {
  await page.goto('/admin/login');

  await expect(page.getByRole('heading', { name: /admin login/i })).toBeVisible();

  await page.getByLabel('Email').fill('admin@test.com');
  await page.getByLabel('Password').fill('password123');

  await page.getByRole('button', { name: /login as admin/i }).click();

  await expect(page).toHaveURL(/\/admin\/products/);
  await expect(page.getByRole('heading', { name: /admin products/i })).toBeVisible();

  await expect(page.getByRole('link', { name: /add product/i })).toBeVisible();
});
