import { pickLocaleText } from "@/lib/i18n";
import { getStringField, isRecord, parseJsonArray } from "@/lib/json";
import type { AppLocale } from "@/lib/i18n";
import HomeHeroBlock from "@/components/home/HomeHeroBlock";
import HomeStatsBlock from "@/components/home/HomeStatsBlock";
import HomeFeaturesBlock from "@/components/home/HomeFeaturesBlock";
import HomeTestimonialsBlock from "@/components/home/HomeTestimonialsBlock";
import HomeCtaBlock from "@/components/home/HomeCtaBlock";

export type HomePageBlock = {
  id: number;
  key: string;
  type: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
  itemsJson: string;
  locale: string;
  sortOrder: number;
};

type StatItem = {
  value: string;
  label: string;
  subLabel?: string;
};

type TestimonialItem = {
  quote: string;
  name: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
};

type HomeBlocksProps = {
  blocks: HomePageBlock[];
  locale: AppLocale;
};

const parseObjectItems = <T,>(input: string, guard: (item: unknown) => item is T): T[] => parseJsonArray(input, guard);

const isStatItem = (item: unknown): item is StatItem =>
  isRecord(item) && typeof getStringField(item, "value") === "string" && typeof getStringField(item, "label") === "string";

const isTestimonialItem = (item: unknown): item is TestimonialItem =>
  isRecord(item) && typeof getStringField(item, "quote") === "string" && typeof getStringField(item, "name") === "string";

export function HomeBlocks({ blocks, locale }: HomeBlocksProps) {
  const t = (en: string, vi: string) => pickLocaleText(locale, en, vi);

  return (
    <>
      {blocks.map((block) => {
        const type = block.type.toLowerCase();
        const items = parseJsonArray(block.itemsJson, (value): value is string => typeof value === "string");
        const stats = parseObjectItems(block.itemsJson, isStatItem);
        const testimonials = parseObjectItems(block.itemsJson, isTestimonialItem);

        if (type === "hero") {
          return (
            <HomeHeroBlock
              key={block.id}
              title={block.title}
              subtitle={block.subtitle}
              imageUrl={block.imageUrl}
              ctaText={block.ctaText}
              ctaUrl={block.ctaUrl}
              items={items}
              locale={locale}
            />
          );
        }

        if (type === "cta") {
          return <HomeCtaBlock key={block.id} title={block.title} subtitle={block.subtitle} ctaText={block.ctaText} ctaUrl={block.ctaUrl} items={items} localeText={t} />;
        }

        if (type === "feature") {
          return <HomeFeaturesBlock key={block.id} title={block.title} subtitle={block.subtitle} items={items} />;
        }

        if (type === "stats") {
          return <HomeStatsBlock key={block.id} title={block.title} subtitle={block.subtitle} stats={stats} localeText={t} />;
        }

        if (type === "testimonial") {
          return <HomeTestimonialsBlock key={block.id} title={block.title} subtitle={block.subtitle} items={testimonials} localeText={t} />;
        }

        return null;
      })}
    </>
  );
}
