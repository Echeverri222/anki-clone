import { test, expect } from '@playwright/test';

test.describe('Stackki E2E Tests', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Master Anything with')).toBeVisible();
    await expect(page.getByRole('button', { name: /start learning/i })).toBeVisible();
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /sign in/i }).first().click();
    await expect(page).toHaveURL('/signin');
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('should show sign up form', async ({ page }) => {
    await page.goto('/signin');
    await page.getByRole('button', { name: /don't have an account/i }).click();
    await expect(page.getByText('Create an account')).toBeVisible();
  });

  test.skip('full workflow: sign in, create deck, add card, review', async ({ page }) => {
    // This test requires a seeded database with demo@stackki.com
    // Skip by default, enable when you have the demo user set up
    
    // Sign in
    await page.goto('/signin');
    await page.fill('input[type="email"]', 'demo@stackki.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/app');
    await expect(page.getByText('Welcome back')).toBeVisible();
    
    // Create new deck
    await page.getByRole('button', { name: /new deck/i }).click();
    await page.fill('input#deck-name', 'Test Deck');
    await page.fill('input#deck-description', 'E2E test deck');
    await page.getByRole('button', { name: /create deck/i }).click();
    
    // Click on the deck
    await page.getByText('Test Deck').click();
    
    // Add a card
    await page.getByRole('button', { name: /add card/i }).click();
    await page.fill('textarea#front', 'What is 2+2?');
    await page.fill('textarea#back', '4');
    await page.getByRole('button', { name: /create card/i }).click();
    
    // Start study session
    await page.getByRole('button', { name: /study now/i }).click();
    await expect(page.getByText('What is 2+2?')).toBeVisible();
    
    // Show answer
    await page.getByRole('button', { name: /show answer/i }).click();
    await expect(page.getByText('4')).toBeVisible();
    
    // Rate the card
    await page.getByRole('button', { name: /good/i }).click();
    
    // Should complete the session
    await expect(page.getByText('All Done!')).toBeVisible();
  });
});
