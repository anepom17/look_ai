/**
 * Один полный прогон создания гайда с фиксированными ответами и загрузкой фото.
 * Данные: Андрей, 38, мужской; квиз1 → фото ткани + украшений; квиз2; casual luxe + городской минимализм.
 *
 * Запуск (из папки app):
 *   1. Запустить приложение: npm run dev (из корня: npm run dev --prefix app)
 *   2. Запустить тест: npx playwright test full-guide-cycle
 *
 * Фото для фазы 2 (опционально): положить в <корень проекта>/test/
 *   - photo_2026-03-08_15-56-59.jpg (для ткани)
 *   - photo_2026-03-08_15-57-09.jpg (для украшений)
 * Если файлов нет, тест нажимает «Пропустить» и использует предварительный результат.
 *
 * Один прогон = один вызов всех API (colortype, lifestyle, archetype, wardrobe, guide).
 * Wardrobe с генерацией изображений Flux может занимать 3–5+ минут.
 */
import { test, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const TEST_PHOTO_FABRIC = path.join(process.cwd(), "..", "test", "photo_2026-03-08_15-56-59.jpg");
const TEST_PHOTO_WRIST = path.join(process.cwd(), "..", "test", "photo_2026-03-08_15-57-09.jpg");

test.describe("Full guide cycle — one run", () => {
  test("full wizard: meta → colortype (quiz + photos) → lifestyle → archetype → wardrobe → guide → PDF", async ({
    page,
  }) => {
    test.setTimeout(420_000); // один прогон: colortype, lifestyle, archetype, wardrobe (+ images), guide

    // Проверяем наличие тестовых фото (опционально — если нет, пропустим загрузку)
    const hasFabricPhoto = fs.existsSync(TEST_PHOTO_FABRIC);
    const hasWristPhoto = fs.existsSync(TEST_PHOTO_WRIST);
    if (!hasFabricPhoto) {
      console.warn(`[e2e] Fabric photo not found: ${TEST_PHOTO_FABRIC}`);
    }
    if (!hasWristPhoto) {
      console.warn(`[e2e] Wrist photo not found: ${TEST_PHOTO_WRIST}`);
    }

    await page.goto("/");

    // ─── Step 0: Meta ─────────────────────────────────────────────────────
    await expect(page.getByRole("heading", { name: /Давайте познакомимся/i })).toBeVisible();
    await page.getByPlaceholder("Например, Аня").fill("Андрей");
    await page.getByPlaceholder("30").fill("38");
    await page.getByRole("button", { name: /Мужской/ }).click();
    await page.getByRole("button", { name: /Продолжить/ }).click();

    // ─── Step 1: Color type quiz ──────────────────────────────────────────
    await expect(page.getByRole("heading", { name: /Определяем цветотип/i })).toBeVisible();
    await page.getByRole("button", { name: "Чёрные" }).first().click();
    await page.getByRole("button", { name: /Серо-зелёные/ }).first().click();
    await page.getByRole("button", { name: /Серебро \/ белое золото/ }).click();
    await page.getByRole("button", { name: /Загораю хорошо, золотисто/ }).click();
    await page.getByRole("button", { name: /Выгляжу графично и чётко/ }).click();
    await page.getByRole("button", { name: /Средний — умеренная разница/ }).click();
    await page.getByRole("button", { name: /Определить цветотип/ }).click();

    // Ждём либо фазу 2 (уточнение по фото), либо переход на шаг 2 (если сразу без фото)
    const phase2Heading = page.getByRole("heading", { name: /Уточнение по фото/i });
    const step2Heading = page.getByRole("heading", { name: /Образ жизни и внешность/i });
    const anyError = page.locator('[class*="bg-red-50"]').filter({ hasText: /./ });
    await Promise.race([
      phase2Heading.waitFor({ state: "visible", timeout: 40_000 }),
      step2Heading.waitFor({ state: "visible", timeout: 40_000 }),
      anyError.waitFor({ state: "visible", timeout: 40_000 }),
    ]);
    if (await anyError.isVisible()) {
      throw new Error(`Step 1 error: ${await anyError.textContent()}`);
    }

    const isPhase2 = await phase2Heading.isVisible();
    if (isPhase2 && hasFabricPhoto) {
      const fileInputs = page.locator('input[type="file"]');
      await fileInputs.first().setInputFiles(TEST_PHOTO_FABRIC);
      const count = await fileInputs.count();
      if (count >= 2 && hasWristPhoto) {
        await fileInputs.nth(1).setInputFiles(TEST_PHOTO_WRIST);
      }
      await page.getByRole("button", { name: /Отправить фото и получить результат/ }).click();
      await Promise.race([
        step2Heading.waitFor({ state: "visible", timeout: 50_000 }),
        anyError.waitFor({ state: "visible", timeout: 50_000 }),
      ]);
      if (await anyError.isVisible()) {
        throw new Error(`Photo submit error: ${await anyError.textContent()}`);
      }
      await expect(step2Heading).toBeVisible();
    } else if (isPhase2 && !hasFabricPhoto) {
      await page.getByRole("button", { name: /Пропустить, использовать предварительный результат/ }).click();
      await step2Heading.waitFor({ state: "visible", timeout: 15_000 });
    }

    // ─── Step 2: Lifestyle ─────────────────────────────────────────────────
    await expect(step2Heading).toBeVisible();
    await page.getByRole("button", { name: "> 180 см" }).click();
    await page.getByRole("button", { name: /Атлетическое/ }).click();
    await page.getByRole("button", { name: /Удалённо, из дома/ }).click();
    await page.getByRole("button", { name: "Свободный", exact: true }).click();
    await page.getByRole("button", { name: "Спорт / фитнес" }).click();
    await page.getByRole("button", { name: "Прогулки на природе" }).click();
    await page.getByRole("button", { name: "Семейные мероприятия" }).click();
    await page.getByRole("button", { name: "На авто" }).click();
    await page.getByRole("button", { name: /Непринуждённость/ }).click();
    await page.getByRole("button", { name: /Продолжить/ }).click();

    const step3Heading = page.getByRole("heading", { name: /Ваш стилевой архетип/i });
    await Promise.race([
      step3Heading.waitFor({ state: "visible", timeout: 50_000 }),
      anyError.waitFor({ state: "visible", timeout: 50_000 }),
    ]);
    if (await anyError.isVisible()) {
      throw new Error(`Step 2 error: ${await anyError.textContent()}`);
    }
    await expect(step3Heading).toBeVisible();

    // ─── Step 3: Archetype — Casual Luxe (основной) + Городской минимализм (вспомогательный)
    await page.getByRole("button", { name: /Casual Luxe/ }).first().click();
    await page.getByRole("button", { name: /Городской минимализм/ }).first().click();
    await page.getByRole("button", { name: /Сформировать стиль/ }).click();

    // ─── Step 4: Ожидание результатов (wardrobe + guide) и кнопки PDF ─────
    const downloadBtn = page.getByRole("button", { name: /Скачать гид в PDF/ });
    const resultsError = page.locator('[class*="bg-red-50"]').filter({ hasText: /./ });
    await Promise.race([
      downloadBtn.waitFor({ state: "visible", timeout: 300_000 }),
      resultsError.waitFor({ state: "visible", timeout: 300_000 }),
    ]);
    if (await resultsError.isVisible()) {
      throw new Error(`Wardrobe/Guide error: ${await resultsError.textContent()}`);
    }
    await expect(downloadBtn).toBeVisible();

    // Проверка вкладок результатов
    await expect(page.getByText(/Цветотип|Образы|Гардероб|Правила/i).first()).toBeVisible({ timeout: 5000 });

    // Скачивание PDF
    const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
    await downloadBtn.click();
    const download = await downloadPromise;
    const outDir = path.join(process.cwd(), "test-results", "e2e-full-cycle");
    await fs.promises.mkdir(outDir, { recursive: true });
    const pdfPath = path.join(outDir, "guide-download.pdf");
    await download.saveAs(pdfPath);

    const content = fs.readFileSync(pdfPath);
    expect(content.length).toBeGreaterThan(1000);
    expect(content.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  });
});
