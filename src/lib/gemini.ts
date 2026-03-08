import { GoogleGenAI, createPartFromBase64, createPartFromText } from "@google/genai";
import fs from "fs";
import path from "path";
import type {
  ColorTypeQuizAnswers,
  ColorTypeResult,
  ColorTypePreliminaryResponse,
  MetaInput,
  LifestyleAnswers,
  ProfileResult,
  ArchetypeRecommendationsResult,
  ArchetypeResult,
  ArchetypeId,
  WardrobeResult,
  GuideResult,
  Outfit,
} from "./types";

const GEMINI_MODEL = "gemini-3-flash-preview";

let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!_ai) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY");
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
}

function loadPrompt(filename: string): string {
  const promptsDir = path.join(process.cwd(), "..", "prompts");
  const filePath = path.join(promptsDir, filename);
  return fs.readFileSync(filePath, "utf-8");
}

/** Strip markdown code fences and parse JSON from Gemini (often wraps in ```json ... ```). */
function parseJsonFromGemini<T = unknown>(raw: string): T {
  let text = raw.trim();
  const codeBlock = /^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/im;
  const match = text.match(codeBlock);
  if (match) text = match[1].trim();
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    const start = text.indexOf("{");
    if (start !== -1) {
      let depth = 0;
      let end = -1;
      for (let i = start; i < text.length; i++) {
        if (text[i] === "{") depth++;
        else if (text[i] === "}") {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
      if (end !== -1) {
        try {
          return JSON.parse(text.slice(start, end + 1)) as T;
        } catch {
          /* fall through to throw original */
        }
      }
    }
    throw e;
  }
}

const GEMINI_RETRY_ATTEMPTS = 5;
const GEMINI_RETRY_DELAY_MS_MIN = 8_000;
const GEMINI_RETRY_DELAY_MS_MAX = 65_000;

/** Returns true if the error is a 429 rate-limit / quota exceeded. */
function isRateLimitError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const o = err as Record<string, unknown>;
  if (o.status === 429) return true;
  if (o.code === 429) return true;
  const msg = typeof o.message === "string" ? o.message : "";
  return msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota");
}

/** Parse retry delay from API error (e.g. "Please retry in 7.36s" or RetryInfo.retryDelay). Returns ms. */
function getRetryDelayMs(err: unknown, attempt: number): number {
  const fallback = Math.min(
    GEMINI_RETRY_DELAY_MS_MIN * Math.pow(2, attempt - 1),
    GEMINI_RETRY_DELAY_MS_MAX
  );
  try {
    const msg = typeof (err as { message?: string }).message === "string" ? (err as { message: string }).message : "";
    const match = msg.match(/retry in (\d+(?:\.\d+)?)\s*s/i) ?? msg.match(/retryDelay["\s:]+(\d+)/i);
    if (match) {
      const sec = parseFloat(match[1]);
      if (Number.isFinite(sec) && sec > 0) {
        const ms = Math.ceil(sec * 1000);
        return Math.min(Math.max(ms, GEMINI_RETRY_DELAY_MS_MIN), GEMINI_RETRY_DELAY_MS_MAX);
      }
    }
    let parsed: { error?: { details?: Array<{ retryDelay?: string }> } };
    try {
      parsed = typeof msg === "string" && msg.startsWith("{") ? JSON.parse(msg) : {};
    } catch {
      return fallback;
    }
    const delayStr = parsed.error?.details?.find((d: { retryDelay?: string }) => d.retryDelay)?.retryDelay;
    if (delayStr) {
      const sec = parseFloat(delayStr.replace(/s$/i, ""));
      if (Number.isFinite(sec)) return Math.min(Math.max(Math.ceil(sec * 1000), GEMINI_RETRY_DELAY_MS_MIN), GEMINI_RETRY_DELAY_MS_MAX);
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

async function callStructuredGemini<T>(
  systemPrompt: string,
  userMessage: string
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= GEMINI_RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await getAI().models.generateContent({
        model: GEMINI_MODEL,
        contents: userMessage,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const text = response.text;
      if (!text || typeof text !== "string") throw new Error("Empty response from Gemini");

      return parseJsonFromGemini<T>(text);
    } catch (err) {
      lastError = err;
      if (attempt < GEMINI_RETRY_ATTEMPTS && isRateLimitError(err)) {
        const delayMs = getRetryDelayMs(err, attempt);
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// ─── Step 1: Color Type ───────────────────────────────────────────────────────

export async function determineColorType(
  answers: ColorTypeQuizAnswers,
  gender: string
): Promise<ColorTypeResult> {
  const systemPrompt = loadPrompt("step1-colortype.md");
  const userMessage = JSON.stringify({ ...answers, gender });
  return callStructuredGemini<ColorTypeResult>(systemPrompt, userMessage);
}

/** Phase 1: quiz only → preliminary result + personalized photo request. */
export async function determineColorTypePreliminary(
  answers: ColorTypeQuizAnswers,
  gender: string
): Promise<ColorTypePreliminaryResponse> {
  const systemPrompt = loadPrompt("step1-colortype-preliminary.md");
  const userMessage = JSON.stringify({ ...answers, gender });
  return callStructuredGemini<ColorTypePreliminaryResponse>(systemPrompt, userMessage);
}

/** Phase 2: preliminary + selfie (and optional wrist photo) → final color type. */
export async function determineColorTypeFinal(
  preliminaryResult: ColorTypeResult,
  selfiePhoto: { base64: string; mimeType: string },
  wristPhoto?: { base64: string; mimeType: string }
): Promise<ColorTypeResult> {
  const systemPrompt = loadPrompt("step1-colortype-final.md");
  const textPart = createPartFromText(
    "Preliminary result from quiz:\n" + JSON.stringify(preliminaryResult, null, 2)
  );
  const selfiePart = createPartFromBase64(selfiePhoto.base64, selfiePhoto.mimeType);
  const parts = [textPart, selfiePart];
  if (wristPhoto) {
    parts.push(createPartFromText("\nSecond image: wrist with silver/gold jewelry (daylight)."));
    parts.push(createPartFromBase64(wristPhoto.base64, wristPhoto.mimeType));
  }
  let lastError: unknown;
  for (let attempt = 1; attempt <= GEMINI_RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await getAI().models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });
      const text = response.text;
      if (!text || typeof text !== "string") throw new Error("Empty response from Gemini");
      return parseJsonFromGemini<ColorTypeResult>(text);
    } catch (err) {
      lastError = err;
      if (attempt < GEMINI_RETRY_ATTEMPTS && isRateLimitError(err)) {
        const delayMs = getRetryDelayMs(err, attempt);
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// ─── Step 2: Lifestyle Profile ────────────────────────────────────────────────

export async function buildLifestyleProfile(
  meta: MetaInput,
  colorType: Pick<ColorTypeResult, "season" | "temperature">,
  answers: LifestyleAnswers
): Promise<ProfileResult> {
  const systemPrompt = loadPrompt("step2-lifestyle.md");
  const userMessage = JSON.stringify({ meta, colorType, answers });
  const result = await callStructuredGemini<{ profile: ProfileResult }>(
    systemPrompt,
    userMessage
  );
  return result.profile;
}

// ─── Step 3A: Archetype Recommendations ──────────────────────────────────────

export async function getArchetypeRecommendations(
  meta: MetaInput,
  colorType: Pick<ColorTypeResult, "season" | "temperature" | "saturation">,
  profile: Pick<ProfileResult, "dresscode" | "styleGoal" | "mobility" | "keyInsights">
): Promise<ArchetypeRecommendationsResult> {
  const systemPrompt = loadPrompt("step3-archetype.md");
  const userMessage = JSON.stringify({
    subtask: "A",
    meta,
    colorType,
    profile,
  });
  return callStructuredGemini<ArchetypeRecommendationsResult>(
    systemPrompt,
    userMessage
  );
}

// ─── Step 3B: Style Vector ────────────────────────────────────────────────────

export async function buildStyleVector(
  meta: MetaInput,
  colorType: Pick<ColorTypeResult, "season" | "temperature">,
  profile: Pick<ProfileResult, "styleGoal" | "keyInsights">,
  selection: { primary: ArchetypeId; secondary: ArchetypeId | null }
): Promise<ArchetypeResult> {
  const systemPrompt = loadPrompt("step3-archetype.md");
  const userMessage = JSON.stringify({
    subtask: "B",
    meta,
    colorType,
    profile,
    selection,
  });
  const result = await callStructuredGemini<{ archetype: ArchetypeResult }>(
    systemPrompt,
    userMessage
  );
  return result.archetype;
}

// ─── Step 4: Wardrobe & Outfits ───────────────────────────────────────────────

export async function buildWardrobe(
  meta: MetaInput,
  colorType: ColorTypeResult,
  profile: ProfileResult,
  archetype: ArchetypeResult
): Promise<WardrobeResult> {
  const systemPrompt = loadPrompt("step4-wardrobe.md");
  const userMessage = JSON.stringify({ meta, colorType, profile, archetype });
  return callStructuredGemini<WardrobeResult>(systemPrompt, userMessage);
}

// ─── Step 5: Guide ────────────────────────────────────────────────────────────

/** Strip imageDataUrl from wardrobe to avoid sending huge base64 payloads to Gemini (saves tokens, avoids 429 TPM). */
function wardrobeForGuide(wardrobe: WardrobeResult): WardrobeResult {
  return {
    ...wardrobe,
    outfits: wardrobe.outfits.map(({ imageDataUrl: _, ...outfit }) => outfit),
  };
}

export async function buildGuide(
  meta: MetaInput,
  colorType: ColorTypeResult,
  profile: ProfileResult,
  archetype: ArchetypeResult,
  wardrobe: WardrobeResult
): Promise<GuideResult> {
  const systemPrompt = loadPrompt("step5-guide.md");
  const userMessage = JSON.stringify({
    meta,
    colorType,
    profile,
    archetype,
    wardrobe: wardrobeForGuide(wardrobe),
  });
  return callStructuredGemini<GuideResult>(systemPrompt, userMessage);
}

// ─── Outfit image prompts (for use with Flux or other image API) ─────────────

interface OutfitImagePromptsResponse {
  prompts: string[];
}

/** Returns one English image-generation prompt per outfit. */
export async function getOutfitImagePrompts(
  outfits: Outfit[],
  gender: string
): Promise<string[]> {
  const systemPrompt = loadPrompt("outfit-image-prompts.md");
  const userMessage = JSON.stringify({ outfits, gender });
  const result = await callStructuredGemini<OutfitImagePromptsResponse>(
    systemPrompt,
    userMessage
  );
  if (!result.prompts || result.prompts.length !== outfits.length) {
    throw new Error("getOutfitImagePrompts: prompts length mismatch");
  }
  return result.prompts;
}
