import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('customer can browse, add to cart, login, and checkout', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /storefront/i })).toBeVisible();

  await page.getByRole('link', { name: /view product/i }).first().click();

  const addToCartButton = page.getByTestId('add-to-cart-button');

  await expect(addToCartButton).toBeVisible();
  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();

  await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
  await page.getByRole('button', { name: /add to cart/i }).click();

  await page.getByRole('link', { name: /view cart/i }).click();

  await expect(page.getByRole('heading', { name: /^cart$/i })).toBeVisible();

  await page.getByRole('button', { name: /checkout/i }).click();

  await expect(page).toHaveURL(/\/login/);

  await page.getByLabel('Email').fill('customer@test.com');
  await page.getByLabel('Password').fill('password123');

  await page.getByRole('button', { name: /^login$/i }).click();

  await expect(page).toHaveURL(/\/cart/);

  await page.getByRole('button', { name: /checkout/i }).click();

  await expect(page).toHaveURL(/\/orders\/.+/);
  await expect(page.getByRole('heading', { name: /order confirmed/i })).toBeVisible();
  await expect(page.getByText(/status:/i)).toBeVisible();
});
