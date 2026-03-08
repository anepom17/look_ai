import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.describe("PDF guide download", () => {
  test("full wizard flow and PDF download returns valid file", async ({
    page,
  }) => {
    test.setTimeout(200_000); // ~3 min: APIs (colortype, lifestyle, archetype x2, wardrobe, guide) + PDF

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

    const step2Heading = page.getByRole("heading", { name: /Образ жизни и внешность/i });
    const anyError = page.locator('[class*="bg-red-50"]').filter({ hasText: /./ });
    await Promise.race([
      step2Heading.waitFor({ state: "visible", timeout: 25000 }),
      anyError.waitFor({ state: "visible", timeout: 25000 }),
    ]);
    if (await anyError.isVisible()) {
      throw new Error(`Step 1 failed: ${await anyError.textContent()}`);
    }

    // ─── Step 2: Lifestyle ────────────────────────────────────────────────
    await page.getByRole("button", { name: "160–170 см" }).click();
    await page.getByRole("button", { name: /Песочные часы/ }).click();
    await page.getByRole("button", { name: /Офис — smart casual/ }).click();
    await page.getByRole("button", { name: "Smart casual", exact: true }).click();
    await page.getByRole("button", { name: "Кафе с друзьями" }).click();
    await page.getByRole("button", { name: "Пешком" }).click();
    await page.getByRole("button", { name: /Элегантность/ }).click();
    await page.getByRole("button", { name: /Продолжить/ }).click();

    await Promise.race([
      page.getByRole("heading", { name: /Ваш стилевой архетип/i }).waitFor({ state: "visible", timeout: 45000 }),
      anyError.waitFor({ state: "visible", timeout: 45000 }),
    ]);
    if (await anyError.isVisible()) {
      throw new Error(`Step 2 failed: ${await anyError.textContent()}`);
    }

    // ─── Step 3: Archetype ─────────────────────────────────────────────────
    await page.getByRole("button", { name: /Интеллектуальная|Современная|Городской|Творческая|Casual|Уличный/ }).first().click();
    await page.getByRole("button", { name: /Сформировать стиль/ }).click();

    // ─── Step 4: Building wardrobe (loading) → Step 5: Results ─────────────
    const downloadButton = page.getByRole("button", { name: /Скачать гид в PDF/ });
    await downloadButton.waitFor({ state: "visible", timeout: 120_000 });

    // ─── PDF download ─────────────────────────────────────────────────────
    const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
    await downloadButton.click();
    const download = await downloadPromise;

    const outDir = path.join(process.cwd(), "test-results", "e2e-pdf");
    await fs.promises.mkdir(outDir, { recursive: true });
    const pdfPath = path.join(outDir, "guide-download.pdf");
    await download.saveAs(pdfPath);

    const content = fs.readFileSync(pdfPath);
    expect(content.length).toBeGreaterThan(1000);
    expect(content.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  });
});
