"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PaletteStrip } from "@/components/ui/ColorSwatch";
import type { ColorTypeResult, LifestyleAnswers, Gender, Dresscode } from "@/lib/types";

interface Step2Props {
  colorType: ColorTypeResult;
  gender: Gender;
  onComplete: (answers: LifestyleAnswers) => void;
  isLoading: boolean;
}

const SOCIAL_CONTEXTS = [
  { value: "cafe_friends", label: "Кафе с друзьями" },
  { value: "cultural_event", label: "Театр / выставки / кино" },
  { value: "restaurants", label: "Рестораны" },
  { value: "sport_active", label: "Спорт / фитнес" },
  { value: "outdoor_walk", label: "Прогулки на природе" },
  { value: "travel", label: "Путешествия" },
  { value: "parties", label: "Вечеринки" },
  { value: "family_events", label: "Семейные мероприятия" },
  { value: "romantic_evening", label: "Романтические вечера" },
  { value: "work_to_evening", label: "Офис → вечернее мероприятие" },
];

const BODY_TYPES_FEMALE = [
  { value: "rectangle", label: "Прямоугольник (плечи, талия и бёдра примерно одинаковы)" },
  { value: "hourglass", label: "Песочные часы (выраженная талия, бёдра и плечи одинаковы)" },
  { value: "pear", label: "Груша (бёдра шире плеч)" },
  { value: "apple", label: "Яблоко (объём в центре, не выраженная талия)" },
  { value: "inverted_triangle", label: "Перевёрнутый треугольник (плечи шире бёдер)" },
];

const BODY_TYPES_MALE = [
  { value: "rectangle", label: "Прямоугольник (примерно одинаковые плечи, талия, бёдра)" },
  { value: "trapezoid", label: "Трапеция (плечи шире талии и бёдер)" },
  { value: "athletic", label: "Атлетическое (выраженные мышцы, V-образный торс)" },
  { value: "oval", label: "Овал (объём в области живота)" },
];

const BODY_TYPES_NEUTRAL = [
  { value: "slim", label: "Стройное" },
  { value: "medium", label: "Среднее" },
  { value: "full", label: "Плотное" },
  { value: "large", label: "Крупное" },
];

const STYLE_GOALS = [
  { value: "energy_brightness", label: "Энергия и яркость — хочу выглядеть живо и динамично" },
  { value: "elegance", label: "Элегантность — благородство и утончённость" },
  { value: "confidence", label: "Уверенность — сила и авторитетность" },
  { value: "ease", label: "Непринуждённость — лёгкость и комфорт" },
  { value: "creativity", label: "Творческая свобода — индивидуальность и нестандартность" },
  { value: "restraint", label: "Сдержанность — минимализм и нейтралитет" },
];

function ToggleButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
        selected
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
      }`}
    >
      {children}
    </button>
  );
}

export function Step2Lifestyle({ colorType, gender, onComplete, isLoading }: Step2Props) {
  const [height, setHeight] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [work, setWork] = useState("");
  const [dresscode, setDresscode] = useState<Dresscode | "">("");
  const [socialContexts, setSocialContexts] = useState<string[]>([]);
  const [mobility, setMobility] = useState<"pedestrian" | "transit" | "car" | "">("");
  const [styleGoal, setStyleGoal] = useState("");
  const [currentLikes, setCurrentLikes] = useState("");
  const [currentDislikes, setCurrentDislikes] = useState("");

  const bodyTypes =
    gender === "female"
      ? BODY_TYPES_FEMALE
      : gender === "male"
      ? BODY_TYPES_MALE
      : BODY_TYPES_NEUTRAL;

  const toggleContext = (v: string) =>
    setSocialContexts((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );

  const canProceed =
    height && bodyType && work && dresscode && socialContexts.length > 0 && mobility && styleGoal;

  function handleSubmit() {
    if (!canProceed) return;
    onComplete({
      height,
      bodyType,
      work,
      dresscode: dresscode as Dresscode,
      socialContexts,
      mobility: mobility as "pedestrian" | "transit" | "car",
      styleGoal,
      currentLikes,
      currentDislikes,
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-1">Образ жизни и внешность</h2>
        <p className="text-zinc-500 text-sm">Это поможет создать реально применимые рекомендации</p>
      </div>

      {/* Color type result preview */}
      <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5 space-y-4">
        <div>
          <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Ваш цветотип</p>
          <p className="text-lg font-bold text-zinc-900">{colorType.season}</p>
          <p className="text-sm text-zinc-500 mt-1">{colorType.description}</p>
        </div>
        <PaletteStrip colors={colorType.palette.best} label="Лучшие цвета" />
        <PaletteStrip colors={colorType.palette.neutral} label="Нейтральная база" />
      </div>

      {/* Height */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">Рост</p>
        <div className="grid grid-cols-2 gap-2">
          {["< 160 см", "160–170 см", "170–180 см", "> 180 см"].map((h) => (
            <ToggleButton key={h} selected={height === h} onClick={() => setHeight(h)}>
              {h}
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Body type */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">Тип телосложения</p>
        <div className="grid grid-cols-1 gap-2">
          {bodyTypes.map((b) => (
            <ToggleButton key={b.value} selected={bodyType === b.value} onClick={() => setBodyType(b.value)}>
              {b.label}
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Work */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">Место и характер работы</p>
        <div className="grid grid-cols-1 gap-2">
          {[
            { value: "office_formal", label: "Офис со строгим дресс-кодом" },
            { value: "office_casual", label: "Офис — smart casual / свободный" },
            { value: "remote", label: "Удалённо, из дома" },
            { value: "meetings_travel", label: "Разъезды, встречи, переговоры" },
            { value: "physical", label: "Физический труд / на улице" },
            { value: "creative", label: "Творческая / арт среда" },
            { value: "none", label: "Не работаю / в декрете" },
          ].map((w) => (
            <ToggleButton key={w.value} selected={work === w.value} onClick={() => setWork(w.value)}>
              {w.label}
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Dresscode */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">Дресс-код на работе</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "strict", label: "Строгий деловой" },
            { value: "smart_casual", label: "Smart casual" },
            { value: "free", label: "Свободный" },
            { value: "none", label: "Нет дресс-кода" },
          ].map((d) => (
            <ToggleButton
              key={d.value}
              selected={dresscode === d.value}
              onClick={() => setDresscode(d.value as Dresscode)}
            >
              {d.label}
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Social contexts */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">
          Социальные контексты{" "}
          <span className="text-zinc-400 font-normal">(выберите все актуальные)</span>
        </p>
        <div className="grid grid-cols-1 gap-2">
          {SOCIAL_CONTEXTS.map((c) => (
            <button
              key={c.value}
              onClick={() => toggleContext(c.value)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm transition-all text-left ${
                socialContexts.includes(c.value)
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
              }`}
            >
              <span
                className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                  socialContexts.includes(c.value)
                    ? "border-white bg-white"
                    : "border-zinc-300"
                }`}
              >
                {socialContexts.includes(c.value) && (
                  <svg className="w-3 h-3 text-zinc-900" fill="none" viewBox="0 0 12 12">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobility */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">Как обычно передвигаетесь?</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "pedestrian", label: "Пешком" },
            { value: "transit", label: "Транспорт" },
            { value: "car", label: "На авто" },
          ].map((m) => (
            <ToggleButton
              key={m.value}
              selected={mobility === m.value}
              onClick={() => setMobility(m.value as "pedestrian" | "transit" | "car")}
            >
              {m.label}
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Style goal */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">Что хочется транслировать своим образом?</p>
        <div className="grid grid-cols-1 gap-2">
          {STYLE_GOALS.map((g) => (
            <ToggleButton key={g.value} selected={styleGoal === g.value} onClick={() => setStyleGoal(g.value)}>
              {g.label}
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Current wardrobe */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700">
            Что нравится в текущем гардеробе?{" "}
            <span className="text-zinc-400 font-normal">(опционально)</span>
          </label>
          <textarea
            value={currentLikes}
            onChange={(e) => setCurrentLikes(e.target.value)}
            rows={2}
            placeholder="Например: удобные джинсы, хорошие жакеты"
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm resize-none"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700">
            Что хочется изменить?{" "}
            <span className="text-zinc-400 font-normal">(опционально)</span>
          </label>
          <textarea
            value={currentDislikes}
            onChange={(e) => setCurrentDislikes(e.target.value)}
            rows={2}
            placeholder="Например: слишком много чёрного, нет интересных образов"
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm resize-none"
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!canProceed || isLoading}
        loading={isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading ? "Анализируем профиль..." : "Продолжить →"}
      </Button>
    </div>
  );
}
