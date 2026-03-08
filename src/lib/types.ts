// ─── Core value types ────────────────────────────────────────────────────────

export type Gender = "male" | "female" | "neutral";
export type Temperature = "warm" | "cool" | "neutral";
export type Contrast = "high" | "medium" | "low";
export type Saturation = "bright" | "muted";
export type Depth = "deep" | "medium" | "light";
export type Dresscode = "strict" | "smart_casual" | "free" | "none";
export type Priority = "high" | "medium" | "low";
export type StyleGoal =
  | "energy_brightness"
  | "elegance"
  | "confidence"
  | "ease"
  | "creativity"
  | "restraint";

export type ArchetypeId =
  | "intellectual_elegance"
  | "modern_classic"
  | "urban_minimal"
  | "creative_bohemian"
  | "casual_luxe"
  | "street_urban";

// ─── Color ───────────────────────────────────────────────────────────────────

export interface Color {
  name: string;
  hex: string;
}

// ─── Step 0 — Meta ───────────────────────────────────────────────────────────

export interface MetaInput {
  name: string | null;
  gender: Gender;
  age: number;
}

// ─── Step 1 — Color Type Quiz ────────────────────────────────────────────────

export interface ColorTypeQuizAnswers {
  hair: string;
  eyes: string;
  jewelry: "silver" | "gold";
  tan: string;
  blackReaction: "graphic" | "pale" | "neutral";
  contrast: Contrast;
}

export interface ColorTypePalette {
  best: Color[];
  neutral: Color[];
  avoid: Color[];
}

export interface ColorTypeResult {
  season: string;
  seasonEN: string;
  temperature: Temperature;
  contrast: Contrast;
  saturation: Saturation;
  depth: Depth;
  description: string;
  palette: ColorTypePalette;
  metals: { best: string; avoid: string };
  makeupNote: string | null;
}

/** Personalized request for selfie/wrist photos to refine color type (step 1 phase 2). */
export interface ColorTypePhotoRequest {
  selfieInstruction: string;
  needWristJewelryPhoto: boolean;
  wristInstruction?: string;
}

/** Response from first color-type API call (quiz only): preliminary result + photo request. */
export interface ColorTypePreliminaryResponse {
  preliminaryResult: ColorTypeResult;
  photoRequest: ColorTypePhotoRequest;
}

// ─── Step 2 — Lifestyle Profile ──────────────────────────────────────────────

export interface LifestyleAnswers {
  height: string;
  bodyType: string;
  work: string;
  dresscode: Dresscode;
  socialContexts: string[];
  mobility: "pedestrian" | "transit" | "car";
  styleGoal: string;
  currentLikes: string;
  currentDislikes: string;
}

export interface SocialContext {
  context: string;
  priority: Priority;
}

export interface ProfileResult {
  height: string;
  bodyType: string;
  bodyTypeNote: string;
  work: string;
  dresscode: Dresscode;
  socialContexts: SocialContext[];
  mobility: "pedestrian" | "transit" | "car";
  styleGoal: StyleGoal;
  styleGoalDescription: string;
  currentLikes: string;
  currentDislikes: string;
  keyInsights: string[];
}

// ─── Step 3 — Archetype ──────────────────────────────────────────────────────

export interface ArchetypeInfo {
  id: ArchetypeId;
  name: string;
}

export interface ArchetypeRecommendation {
  archetypeId: ArchetypeId;
  nameru: string;
  rank: number;
  fitScore: "high" | "medium" | "low";
  reason: string;
}

export interface ArchetypeRecommendationsResult {
  recommendations: ArchetypeRecommendation[];
  note: string | null;
}

export interface ArchetypeResult {
  primary: ArchetypeInfo;
  secondary: ArchetypeInfo | null;
  vector: string;
  coreFormula: string;
  principles: string[];
}

// ─── Step 4 — Wardrobe ───────────────────────────────────────────────────────

export interface CapsuleItem {
  number: number;
  item: string;
  role: string;
  colors: Color[];
  silhouette: string;
  avoid: string;
}

export interface OutfitPiece {
  item: string;
  color: string;
  hex: string;
}

export interface Outfit {
  context: string;
  headline: string;
  pieces: OutfitPiece[];
  shoes: OutfitPiece;
  accessory: string;
  formula: string;
  effect: string;
  transition: string | null;
  /** Data URL for generated look image (e.g. data:image/png;base64,...). */
  imageDataUrl?: string;
}

export interface WardrobeResult {
  capsule: CapsuleItem[];
  outfits: Outfit[];
  universalRule: string;
}

// ─── Step 5 — Guide ──────────────────────────────────────────────────────────

export interface Reference {
  name: string;
  profession: string;
  colorTypeSimilarity: string;
  styleSimilarity: string;
  whatToAdopt: string[];
}

export interface PersonalRule {
  rule: string;
  context: string;
}

export interface SlideContent {
  heading: string;
  subheading: string | null;
  body: string | null;
  colorSwatches: Color[] | null;
  listItems: string[] | null;
  outfitRef: string | null;
}

export interface Slide {
  slideNumber: number;
  title: string;
  type: "cover" | "text" | "palette" | "outfit" | "capsule" | "references" | "rules";
  content: SlideContent;
}

export interface GuideResult {
  references: Reference[];
  personalRules: PersonalRule[];
  guideTitle: string;
  guideSubtitle: string;
  slides: Slide[];
}

// ─── Full Profile (session state) ────────────────────────────────────────────

export interface StyleProfile {
  meta: MetaInput;
  colorTypeAnswers: ColorTypeQuizAnswers;
  colorType: ColorTypeResult;
  lifestyleAnswers: LifestyleAnswers;
  profile: ProfileResult;
  archetypeRecommendations: ArchetypeRecommendationsResult;
  archetype: ArchetypeResult;
  wardrobe: WardrobeResult;
  guide: GuideResult;
}

// ─── Wizard state ─────────────────────────────────────────────────────────────

export type WizardStep = 0 | 1 | 2 | 3 | 4 | 5;

export interface WizardState {
  currentStep: WizardStep;
  isLoading: boolean;
  error: string | null;
  meta: MetaInput | null;
  colorTypeAnswers: ColorTypeQuizAnswers | null;
  /** Set after quiz submit when waiting for optional selfie/wrist photos. */
  colorTypePreliminary: ColorTypePreliminaryResponse | null;
  colorType: ColorTypeResult | null;
  lifestyleAnswers: LifestyleAnswers | null;
  profile: ProfileResult | null;
  archetypeRecommendations: ArchetypeRecommendationsResult | null;
  archetypeSelection: { primary: ArchetypeId; secondary: ArchetypeId | null } | null;
  archetype: ArchetypeResult | null;
  wardrobe: WardrobeResult | null;
  guide: GuideResult | null;
}

// ─── Archetype catalog (static) ──────────────────────────────────────────────

export const ARCHETYPES: Record<
  ArchetypeId,
  { nameRu: string; nameEn: string; keywords: string[]; formula: string; description: string }
> = {
  intellectual_elegance: {
    nameRu: "Интеллектуальная элегантность",
    nameEn: "Intellectual Elegance",
    keywords: ["продуманность", "сдержанность", "структура", "детали"],
    formula: "структурированная вещь + лёгкий элемент + одна выразительная деталь",
    description:
      "Стиль людей, для которых одежда — это язык. Жакеты, прямые силуэты, спокойные цвета. Образ выглядит умно и благородно, но никогда скучно.",
  },
  modern_classic: {
    nameRu: "Современная классика",
    nameEn: "Modern Classic",
    keywords: ["вне времени", "качество", "нейтральность", "универсальность"],
    formula: "монохромная база + хорошая обувь + минимальный аксессуар",
    description:
      "Классические формы в современном прочтении. Инвестиция в качество, а не тренды. Образ всегда актуален и выглядит дорого.",
  },
  urban_minimal: {
    nameRu: "Городской минимализм",
    nameEn: "Urban Minimal",
    keywords: ["геометрия", "функциональность", "чистые линии", "сдержанность"],
    formula: "чистый силуэт + нейтральная палитра + архитектурная деталь",
    description:
      "Одежда как архитектура. Минимум лишнего, максимум формы. Серые, белые, чёрные тона — и неожиданная деталь, которая делает образ.",
  },
  creative_bohemian: {
    nameRu: "Творческая богема",
    nameEn: "Creative Bohemian",
    keywords: ["текстуры", "лайеринг", "арт", "нестандартность"],
    formula: "лайеринг + смешение текстур + натуральные материалы + яркий акцент",
    description:
      "Стиль людей с художественным взглядом. Смешение фактур, неожиданные сочетания, этнические детали. Образ всегда рассказывает историю.",
  },
  casual_luxe: {
    nameRu: "Casual Luxe",
    nameEn: "Casual Luxe",
    keywords: ["роскошная повседневность", "мягкость", "качество", "ненарочитость"],
    formula: "мягкая ткань + нейтральный тон + кожаная или металлическая деталь",
    description:
      "Повседневная одежда, но из лучших материалов. Кашемир, мягкая кожа, дорогие детали. Выглядит небрежно дорого.",
  },
  street_urban: {
    nameRu: "Уличный урбан",
    nameEn: "Street Urban",
    keywords: ["актуальность", "движение", "практичность", "тренды"],
    formula: "оверсайз силуэт + утилитарный элемент + statement обувь",
    description:
      "Городской стиль с уличной энергией. Оверсайз, карго, кроссовки. Образ современный, практичный и всегда в курсе трендов.",
  },
};
