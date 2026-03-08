import React from "react";
import path from "path";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type {
  ColorTypeResult,
  ProfileResult,
  ArchetypeResult,
  WardrobeResult,
  GuideResult,
  MetaInput,
  Color,
  Outfit,
  CapsuleItem,
} from "./types";

// ─── Font registration ────────────────────────────────────────────────────────

const fontsDir = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "Roboto",
  fonts: [
    { src: path.join(fontsDir, "Roboto-Regular.ttf"),    fontWeight: "normal", fontStyle: "normal" },
    { src: path.join(fontsDir, "Roboto-Bold.ttf"),       fontWeight: "bold",   fontStyle: "normal" },
    { src: path.join(fontsDir, "Roboto-Italic.ttf"),     fontWeight: "normal", fontStyle: "italic" },
    { src: path.join(fontsDir, "Roboto-BoldItalic.ttf"), fontWeight: "bold",   fontStyle: "italic" },
  ],
});

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#F8F7F4",
    padding: 40,
    fontFamily: "Roboto",
  },
  coverPage: {
    backgroundColor: "#1C1C1E",
    padding: 60,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  coverTitle: {
    fontSize: 36,
    color: "#F8F7F4",
    fontFamily: "Roboto",
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 13,
    color: "#A0A0A0",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 40,
  },
  coverTag: {
    fontSize: 11,
    color: "#F8F7F4",
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 9,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 6,
  },
  body: {
    fontSize: 12,
    color: "#3C3C3E",
    lineHeight: 1.6,
    marginBottom: 16,
  },
  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  swatchBlock: {
    width: 70,
    marginBottom: 4,
  },
  swatchColor: {
    width: 70,
    height: 48,
    borderRadius: 4,
    marginBottom: 4,
  },
  swatchLabel: {
    fontSize: 8,
    color: "#555",
    textAlign: "center",
  },
  outfitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  },
  outfitImage: {
    width: "100%",
    maxHeight: 340,
    objectFit: "contain",
    objectPosition: "center",
    borderRadius: 6,
    marginBottom: 12,
  },
  outfitHeadline: {
    fontSize: 14,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  outfitContext: {
    fontSize: 9,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 12,
  },
  outfitFormula: {
    fontSize: 11,
    color: "#3C3C3E",
    lineHeight: 1.5,
    marginBottom: 8,
    fontFamily: "Roboto",
    fontStyle: "italic",
  },
  outfitEffect: {
    fontSize: 11,
    color: "#555",
    lineHeight: 1.5,
  },
  pieceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  pieceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  pieceText: {
    fontSize: 11,
    color: "#3C3C3E",
  },
  capsuleItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 14,
    marginBottom: 8,
  },
  capsuleNumber: {
    fontSize: 9,
    color: "#888",
    marginBottom: 2,
  },
  capsuleName: {
    fontSize: 13,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  capsuleRole: {
    fontSize: 10,
    color: "#666",
    lineHeight: 1.4,
    marginBottom: 8,
  },
  capsuleColors: {
    flexDirection: "row",
    gap: 6,
  },
  miniSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  referenceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
  },
  referenceName: {
    fontSize: 14,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 2,
  },
  referenceProfession: {
    fontSize: 9,
    color: "#888",
    marginBottom: 8,
  },
  referenceWhy: {
    fontSize: 11,
    color: "#3C3C3E",
    lineHeight: 1.5,
    marginBottom: 6,
  },
  adoptItem: {
    fontSize: 10,
    color: "#555",
    lineHeight: 1.5,
    marginLeft: 10,
    marginBottom: 2,
  },
  ruleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 14,
    marginBottom: 8,
    borderLeft: 3,
    borderLeftColor: "#1C1C1E",
  },
  ruleText: {
    fontSize: 12,
    color: "#1C1C1E",
    lineHeight: 1.6,
    marginBottom: 4,
  },
  ruleContext: {
    fontSize: 9,
    color: "#888",
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    right: 40,
    fontSize: 9,
    color: "#AAAAAA",
  },
  divider: {
    borderBottom: 1,
    borderBottomColor: "#E0DED9",
    marginVertical: 16,
  },
  archetypeVector: {
    fontSize: 13,
    color: "#3C3C3E",
    lineHeight: 1.6,
    marginBottom: 12,
    fontFamily: "Roboto",
    fontStyle: "italic",
  },
  principleItem: {
    fontSize: 11,
    color: "#3C3C3E",
    lineHeight: 1.5,
    marginBottom: 6,
    marginLeft: 12,
  },
  universalRule: {
    backgroundColor: "#1C1C1E",
    borderRadius: 6,
    padding: 16,
    marginBottom: 20,
  },
  universalRuleText: {
    fontSize: 12,
    color: "#F8F7F4",
    lineHeight: 1.6,
    fontFamily: "Roboto",
    fontStyle: "italic",
  },
  avoidNote: {
    fontSize: 10,
    color: "#666",
    lineHeight: 1.5,
    marginTop: 4,
  },
});

// ─── Helper components ───────────────────────────────────────────────────────

const Swatch = ({ color }: { color: Color }) => (
  <View style={styles.swatchBlock}>
    <View style={[styles.swatchColor, { backgroundColor: color.hex }]} />
    <Text style={styles.swatchLabel}>{color.name}</Text>
  </View>
);

const PageNum = ({ n }: { n: number }) => (
  <Text style={styles.pageNumber}>{n}</Text>
);

// ─── Pages ───────────────────────────────────────────────────────────────────

const CoverPageComp = ({
  guide,
  meta,
  colorType,
  archetype,
}: {
  guide: GuideResult;
  meta: MetaInput;
  colorType: ColorTypeResult;
  archetype: ArchetypeResult;
}) => (
  <Page size="A4" style={styles.coverPage}>
    <View>
      <Text style={styles.coverSubtitle}>{guide.guideSubtitle}</Text>
      <Text style={styles.coverTitle}>{guide.guideTitle}</Text>
      {meta.name && <Text style={styles.coverTag}>{meta.name}</Text>}
      <Text style={styles.coverTag}>Цветотип: {colorType.season}</Text>
      <Text style={styles.coverTag}>Архетип: {archetype.primary.name}</Text>
    </View>
  </Page>
);

const ColorTypePage = ({
  colorType,
}: {
  colorType: ColorTypeResult;
}) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.sectionLabel}>Шаг 1</Text>
    <Text style={styles.pageTitle}>Ваш цветотип</Text>
    <View style={styles.divider} />
    <Text style={[styles.body, { fontSize: 18, fontFamily: "Roboto", fontWeight: "bold", marginBottom: 4 }]}>
      {colorType.season}
    </Text>
    <Text style={styles.body}>{colorType.description}</Text>
    <Text style={styles.sectionLabel}>Лучшие металлы украшений</Text>
    <Text style={styles.body}>
      ✓ {colorType.metals.best}{"\n"}✗ {colorType.metals.avoid}
    </Text>
    {colorType.makeupNote && (
      <>
        <Text style={styles.sectionLabel}>Макияж</Text>
        <Text style={styles.body}>{colorType.makeupNote}</Text>
      </>
    )}
    <PageNum n={2} />
  </Page>
);

const PalettePage = ({
  palette,
  title,
  colors,
  note,
  pageNum,
}: {
  palette: ColorTypeResult["palette"];
  title: string;
  colors: Color[];
  note?: string;
  pageNum: number;
}) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.sectionLabel}>Цветовая палитра</Text>
    <Text style={styles.pageTitle}>{title}</Text>
    <View style={styles.divider} />
    <View style={styles.swatchRow}>
      {colors.map((c, i) => (
        <Swatch key={`swatch-${pageNum}-${i}-${c.hex ?? ""}`} color={c} />
      ))}
    </View>
    {note && <Text style={styles.avoidNote}>{note}</Text>}
    <PageNum n={pageNum} />
  </Page>
);

const CapsulePage = ({
  items,
  pageNum,
}: {
  items: CapsuleItem[];
  pageNum: number;
}) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.sectionLabel}>Гардероб</Text>
    <Text style={styles.pageTitle}>Основа гардероба</Text>
    <View style={styles.divider} />
    {items.map((item) => (
      <View key={item.number} style={styles.capsuleItem}>
        <Text style={styles.capsuleNumber}>{item.number.toString().padStart(2, "0")}</Text>
        <Text style={styles.capsuleName}>{item.item}</Text>
        <Text style={styles.capsuleRole}>{item.role}</Text>
        <Text style={[styles.capsuleRole, { color: "#888", fontSize: 9 }]}>
          Силуэт: {item.silhouette}
        </Text>
        <View style={styles.capsuleColors}>
          {item.colors.map((c, ci) => (
            <View
              key={`cap-${item.number}-${ci}-${c.hex ?? ""}`}
              style={[styles.miniSwatch, { backgroundColor: c.hex }]}
            />
          ))}
        </View>
      </View>
    ))}
    <PageNum n={pageNum} />
  </Page>
);

const OutfitPage = ({
  outfit,
  pageNum,
}: {
  outfit: Outfit;
  pageNum: number;
}) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.sectionLabel}>Образы</Text>
    <View style={styles.outfitCard}>
      {outfit.imageDataUrl && (
        <Image src={outfit.imageDataUrl} style={styles.outfitImage} />
      )}
      <Text style={styles.outfitContext}>{outfit.context}</Text>
      <Text style={styles.outfitHeadline}>{outfit.headline}</Text>
      <View style={styles.divider} />
      {outfit.pieces.map((p, i) => (
        <View key={i} style={styles.pieceRow}>
          <View style={[styles.pieceDot, { backgroundColor: p.hex }]} />
          <Text style={styles.pieceText}>
            {p.item} — {p.color}
          </Text>
        </View>
      ))}
      <View style={styles.pieceRow}>
        <View style={[styles.pieceDot, { backgroundColor: outfit.shoes.hex }]} />
        <Text style={styles.pieceText}>
          {outfit.shoes.item} — {outfit.shoes.color}
        </Text>
      </View>
      {outfit.accessory && (
        <Text style={[styles.pieceText, { marginTop: 4, color: "#666" }]}>
          + {outfit.accessory}
        </Text>
      )}
      <View style={styles.divider} />
      <Text style={styles.outfitFormula}>{outfit.formula}</Text>
      <Text style={styles.outfitEffect}>{outfit.effect}</Text>
      {outfit.transition && (
        <Text style={[styles.avoidNote, { marginTop: 8 }]}>
          Трансформация: {outfit.transition}
        </Text>
      )}
    </View>
    <PageNum n={pageNum} />
  </Page>
);

const ArchetypePage = ({
  archetype,
  pageNum,
}: {
  archetype: ArchetypeResult;
  pageNum: number;
}) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.sectionLabel}>Стиль</Text>
    <Text style={styles.pageTitle}>Ваш стилевой архетип</Text>
    <View style={styles.divider} />
    <Text style={[styles.body, { fontSize: 16, fontFamily: "Roboto", fontWeight: "bold" }]}>
      {archetype.primary.name}
      {archetype.secondary ? ` + ${archetype.secondary.name}` : ""}
    </Text>
    <Text style={styles.archetypeVector}>{archetype.vector}</Text>
    <Text style={styles.sectionLabel}>Основная формула образа</Text>
    <Text style={styles.body}>{archetype.coreFormula}</Text>
    <Text style={styles.sectionLabel}>Принципы стиля</Text>
    {archetype.principles.map((p, i) => (
      <Text key={i} style={styles.principleItem}>
        {i + 1}. {p}
      </Text>
    ))}
    <PageNum n={pageNum} />
  </Page>
);

const ReferencesPage = ({
  guide,
  pageNum,
}: {
  guide: GuideResult;
  pageNum: number;
}) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.sectionLabel}>Вдохновение</Text>
    <Text style={styles.pageTitle}>Стилевые ориентиры</Text>
    <View style={styles.divider} />
    {guide.references.map((ref, i) => (
      <View key={i} style={styles.referenceCard}>
        <Text style={styles.referenceName}>{ref.name}</Text>
        <Text style={styles.referenceProfession}>{ref.profession}</Text>
        <Text style={styles.referenceWhy}>
          Цветотип: {ref.colorTypeSimilarity}
        </Text>
        <Text style={styles.referenceWhy}>Стиль: {ref.styleSimilarity}</Text>
        {ref.whatToAdopt.map((item, j) => (
          <Text key={j} style={styles.adoptItem}>
            → {item}
          </Text>
        ))}
      </View>
    ))}
    <PageNum n={pageNum} />
  </Page>
);

const RulesPage = ({
  guide,
  wardrobe,
  pageNum,
}: {
  guide: GuideResult;
  wardrobe: WardrobeResult;
  pageNum: number;
}) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.sectionLabel}>Главное</Text>
    <Text style={styles.pageTitle}>Ваши правила стиля</Text>
    <View style={styles.divider} />
    <View style={styles.universalRule}>
      <Text style={styles.universalRuleText}>{wardrobe.universalRule}</Text>
    </View>
    {guide.personalRules.map((rule, i) => (
      <View key={i} style={styles.ruleCard}>
        <Text style={styles.ruleText}>{rule.rule}</Text>
        <Text style={styles.ruleContext}>{rule.context}</Text>
      </View>
    ))}
    <PageNum n={pageNum} />
  </Page>
);

// ─── Main PDF Document ────────────────────────────────────────────────────────

export const StyleGuidePDF = ({
  meta,
  colorType,
  archetype,
  wardrobe,
  guide,
}: {
  meta: MetaInput;
  colorType: ColorTypeResult;
  profile: ProfileResult;
  archetype: ArchetypeResult;
  wardrobe: WardrobeResult;
  guide: GuideResult;
}) => {
  const outfits = wardrobe.outfits;
  const capsuleHalf1 = wardrobe.capsule.slice(0, 5);
  const capsuleHalf2 = wardrobe.capsule.slice(5, 10);

  let pageCounter = 1;
  const p = () => ++pageCounter;

  return (
    <Document>
      {/* 1. Cover */}
      <CoverPageComp
        key="cover"
        guide={guide}
        meta={meta}
        colorType={colorType}
        archetype={archetype}
      />

      {/* 2. Color Type */}
      <ColorTypePage key="colortype" colorType={colorType} />

      {/* 3. Palette — Best */}
      <PalettePage
        key="palette-neutral"
        palette={colorType.palette}
        title="Базовые нейтральные цвета"
        colors={colorType.palette.neutral}
        pageNum={p()}
      />

      {/* 4. Palette — Accents */}
      <PalettePage
        key="palette-best"
        palette={colorType.palette}
        title="Основные цветовые акценты"
        colors={colorType.palette.best}
        pageNum={p()}
      />

      {/* 5. Palette — Avoid */}
      <PalettePage
        key="palette-avoid"
        palette={colorType.palette}
        title="Чего избегать"
        colors={colorType.palette.avoid}
        note="Эти оттенки могут делать внешность тусклой или подчёркивать недостатки кожи."
        pageNum={p()}
      />

      {/* 6–7. Capsule wardrobe */}
      <CapsulePage key="capsule-1" items={capsuleHalf1} pageNum={p()} />
      {capsuleHalf2.length > 0 && <CapsulePage key="capsule-2" items={capsuleHalf2} pageNum={p()} />}

      {/* 8–14. Outfits */}
      {outfits.map((outfit, i) => (
        <OutfitPage key={`outfit-${i}-${outfit.context}`} outfit={outfit} pageNum={p()} />
      ))}

      {/* 15. Archetype */}
      <ArchetypePage key="archetype" archetype={archetype} pageNum={p()} />

      {/* 16–17. References */}
      <ReferencesPage key="references" guide={guide} pageNum={p()} />

      {/* 18. Rules */}
      <RulesPage key="rules" guide={guide} wardrobe={wardrobe} pageNum={p()} />
    </Document>
  );
};
