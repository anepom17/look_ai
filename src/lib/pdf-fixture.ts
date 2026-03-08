/**
 * Fixture data for testing PDF layout without calling any AI APIs.
 * Used by GET /api/pdf-preview to generate a sample PDF.
 */
import type {
  MetaInput,
  ColorTypeResult,
  ProfileResult,
  ArchetypeResult,
  WardrobeResult,
  GuideResult,
} from "./types";

const color = (name: string, hex: string) => ({ name, hex });

export const pdfFixture = {
  meta: {
    name: "Андрей",
    gender: "male" as const,
    age: 34,
  },
  colorType: {
    season: "Тёмная осень",
    seasonEN: "Dark Autumn",
    temperature: "warm" as const,
    contrast: "high" as const,
    saturation: "muted" as const,
    depth: "deep" as const,
    description:
      "Тёмная осень — тёплый подтон с насыщенными, но приглушёнными оттенками. Идеальны глубокие тёплые цвета: бордовый, тёмный зелёный, сливовый.",
    palette: {
      neutral: [
        color("Глубокий серый", "#4A4A4A"),
        color("Графит", "#3D3D3D"),
        color("Тёплый чёрный", "#2C2C2C"),
      ],
      best: [
        color("Глубокий синий", "#1E3A5F"),
        color("Бордовый", "#722F37"),
        color("Изумрудный", "#0D4D2B"),
        color("Сливовый", "#5C4033"),
      ],
      avoid: [
        color("Светло-персиковый", "#FFDAB9"),
        color("Горчичный", "#DAA520"),
        color("Пыльная роза", "#C9A9A6"),
      ],
    },
    metals: { best: "золото, медь, латунь", avoid: "холодное серебро" },
    makeupNote: null as string | null,
  },
  profile: {
    height: "178 см",
    bodyType: "нормальное телосложение",
    bodyTypeNote: "",
    work: "офис",
    dresscode: "smart_casual" as const,
    socialContexts: [{ context: "работа", priority: "high" as const }],
    mobility: "transit" as const,
    styleGoal: "elegance" as const,
    styleGoalDescription: "Элегантность и сдержанность",
    currentLikes: "рубашки, джинсы",
    currentDislikes: "яркие принты",
    keyInsights: [],
  },
  archetype: {
    primary: { id: "casual_luxe" as const, name: "Casual Luxe" },
    secondary: { id: "modern_classic" as const, name: "Современная классика" },
    vector: "Мягкие ткани, нейтральные тона, одна выразительная деталь.",
    coreFormula: "кашемировый свитер + прямые брюки + кожаная обувь",
    principles: [
      "Качество важнее количества.",
      "Один акцент в образе.",
      "Нейтральная база с тёплым подтоном.",
    ],
  },
  wardrobe: {
    capsule: [
      {
        number: 1,
        item: "Тёмно-синий блейзер",
        role: "База для офиса и мероприятий",
        colors: [color("Тёмно-синий", "#1E3A5F")],
        silhouette: "приталенный",
        avoid: "",
      },
      {
        number: 2,
        item: "Серая водолазка",
        role: "Универсальный низ",
        colors: [color("Графит", "#3D3D3D")],
        silhouette: "облегающий",
        avoid: "",
      },
    ],
    outfits: [
      {
        context: "CASUAL LUXE",
        headline: "Офисный понедельник",
        pieces: [
          { item: "Блейзер", color: "тёмно-синий", hex: "#1E3A5F" },
          { item: "Водолазка", color: "серая", hex: "#4A4A4A" },
          { item: "Брюки чинос", color: "графит", hex: "#3D3D3D" },
        ],
        shoes: { item: "Туфли дерби", color: "коричневые", hex: "#5C4033" },
        accessory: "Кожаный ремень",
        formula: "структурированный верх + мягкий низ + кожа",
        effect: "Собранный, но не формальный образ.",
        transition: null,
        // без imageDataUrl — страница всё равно рендерится (есть headline)
      },
    ],
    universalRule:
      "Один акцент в образе: либо фактура, либо цвет, либо аксессуар.",
  },
  guide: {
    guideTitle: "Гид по гардеробу: Андрей",
    guideSubtitle: "цветотип · архетип · образы",
    references: [
      {
        name: "Стилевой ориентир",
        profession: "актёр",
        colorTypeSimilarity: "тёплый контрастный тип",
        styleSimilarity: "Casual Luxe, качественные ткани",
        whatToAdopt: ["нейтральная палитра", "одна кожаная вещь в образе"],
      },
    ],
    personalRules: [
      {
        rule: "В магазине: если сомневаешься между серым и бежевым — бери серый.",
        context: "цветотип Тёмная осень",
      },
    ],
    slides: [],
  },
} satisfies {
  meta: MetaInput;
  colorType: ColorTypeResult;
  profile: ProfileResult;
  archetype: ArchetypeResult;
  wardrobe: WardrobeResult;
  guide: GuideResult;
};
