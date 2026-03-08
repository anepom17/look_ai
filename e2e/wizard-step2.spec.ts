import { test, expect } from "@playwright/test";

test.describe("Wizard steps 0 → 1 → 2", () => {
  test("completes step 0 (meta), step 1 (colortype), step 2 (lifestyle) and captures error if any", async ({
    page,
  }) => {
    await page.goto("/");

    // ─── Step 0: Meta ─────────────────────────────────────────────────────
    await expect(page.getByRole("heading", { name: /Давайте познакомимся/i })).toBeVisible();
    await page.getByPlaceholder("30").fill("30");
    await page.getByRole("button", { name: /Женский/ }).click();
    await page.getByRole("button", { name: /Продолжить/ }).click();

    // ─── Step 1: Color type ───────────────────────────────────────────────
    await expect(page.getByRole("heading", { name: /Определяем цветотип/i })).toBeVisible();
    await page.getByRole("button", { name: /Тёмно-русые/ }).click();
    await page.getByRole("button", { name: /Карие \(светлые/ }).first().click();
    await page.getByRole("button", { name: /Серебро \/ белое золото/ }).click();
    await page.getByRole("button", { name: /Загораю слабо/ }).click();
    await page.getByRole("button", { name: /Нейтрально — особого эффекта/ }).click();
    await page.getByRole("button", { name: /Средний — умеренная разница/ }).click();
    await page.getByRole("button", { name: /Определить цветотип/ }).click();

    // Wait for API: either step 2 appears or error (step 1 or 2)
    const step2Heading = page.getByRole("heading", { name: /Образ жизни и внешность/i });
    const anyError = page.locator('[class*="bg-red-50"]').filter({ hasText: /./ });
    await Promise.race([
      step2Heading.waitFor({ state: "visible", timeout: 25000 }),
      anyError.waitFor({ state: "visible", timeout: 25000 }),
    ]);
    const errAfterStep1 = await anyError.isVisible();
    if (errAfterStep1) {
      const text = await anyError.textContent();
      throw new Error(`Error after step 1 (colortype): ${text?.trim() ?? "Unknown"}`);
    }
    await expect(step2Heading).toBeVisible();

    // ─── Step 2: Lifestyle ────────────────────────────────────────────────
    await page.getByRole("button", { name: "160–170 см" }).click();
    await page.getByRole("button", { name: /Песочные часы/ }).click();
    await page.getByRole("button", { name: /Офис — smart casual/ }).click();
    await page.getByRole("button", { name: "Smart casual", exact: true }).click();
    await page.getByRole("button", { name: "Кафе с друзьями" }).click();
    await page.getByRole("button", { name: "Пешком" }).click();
    await page.getByRole("button", { name: /Элегантность/ }).click();

    // Submit step 2 — this triggers /api/lifestyle and /api/archetype
    await page.getByRole("button", { name: /Продолжить/ }).click();

    // Wait for either step 3 (success) or error message
    const errorBox = page.locator('[class*="bg-red-50"]').filter({ hasText: /./ });
    const step3Heading = page.getByRole("heading", { name: /Ваш стилевой архетип/i });

    const resolved = await Promise.race([
      step3Heading.waitFor({ state: "visible", timeout: 45000 }).then(() => "success" as const),
      errorBox.waitFor({ state: "visible", timeout: 45000 }).then(() => "error" as const),
    ]);

    if (resolved === "error") {
      const errorText = await errorBox.textContent();
      console.error("Step 2 error on page:", errorText);
      throw new Error(`Step 2 failed: ${errorText?.trim() ?? "Unknown error"}`);
    }

    await expect(step3Heading).toBeVisible();
  });
});
