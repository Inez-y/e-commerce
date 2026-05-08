import { expect, test } from '@playwright/test';

test('Customer can browse, add to cart, login and checkout', async({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /storefront/i })).toBeVisible();

    // View product
    const firstViewProductLink = page.getByRole('link', { name: /view product/i, }).first();

    await expect(firstViewProductLink).toBeVisible();
    await firstViewProductLink.click();

    // Add to cart
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();

    await page.getByTestId('add-to-cart-button').click();

    // View cart
    await page.getByRole('link', { name: /view cart/i }).click();

    await expect(page.getByRole('heading', { name: /cart/i })).toBeVisible();

    // Checkout button
    await page.getByTestId('checkout-button').click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByTestId('email-input').fill('customer@test.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-button').click();

    await expect(page).toHaveURL(/\/cart/);

    await page.getByTestId('checkout-button').click();

    // Order confirmation
    await expect(page).toHaveURL(/\/orders\/.+/);
    await expect(page.getByRole('heading', { name: /order confirmed/i })).toBeVisible();
    await expect(page.getByText(/status:/i)).toBeVisible();
});