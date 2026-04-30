"use client";

import type { FormEvent } from "react";
import StudioCourseIdentityFields from "@/components/studio/StudioCourseIdentityFields";
import StudioCourseContentFields from "@/components/studio/StudioCourseContentFields";
import StudioCoursePricingFields from "@/components/studio/StudioCoursePricingFields";
import StudioCourseMediaFields from "@/components/studio/StudioCourseMediaFields";
import StudioCoursePublishActions from "@/components/studio/StudioCoursePublishActions";

type Category = {
  id: number;
  title: string;
};

type TxFn = (en: string, vi: string) => string;

type Props = {
  tx: TxFn;
  categories: Category[];
  title: string;
  setTitle: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  shortDescription: string;
  setShortDescription: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  outcome: string;
  setOutcome: (value: string) => void;
  requirements: string;
  setRequirements: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  flashSalePrice: string;
  setFlashSalePrice: (value: string) => void;
  flashSaleStartsAt: string;
  setFlashSaleStartsAt: (value: string) => void;
  flashSaleEndsAt: string;
  setFlashSaleEndsAt: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
  previewVideoUrl: string;
  setPreviewVideoUrl: (value: string) => void;
  thumbnail: File | null;
  setThumbnail: (value: File | null) => void;
  isPublished: boolean;
  setIsPublished: (value: boolean) => void;
  isUploadingVideo: boolean;
  onPreviewVideoUpload: (file: File) => void;
  onSubmit: (event: FormEvent) => void;
};

export default function StudioCourseForm(props: Props) {
  const { tx, categories, onSubmit, isUploadingVideo } = props;

  return (
    <>
      <StudioCourseIdentityFields tx={tx} title={props.title} setTitle={props.setTitle} categoryId={props.categoryId} setCategoryId={props.setCategoryId} level={props.level} setLevel={props.setLevel} categories={categories} />

      <form onSubmit={onSubmit} className="surface-card space-y-6 rounded-3xl p-8">
        <StudioCourseContentFields
          tx={tx}
          shortDescription={props.shortDescription}
          setShortDescription={props.setShortDescription}
          description={props.description}
          setDescription={props.setDescription}
          outcome={props.outcome}
          setOutcome={props.setOutcome}
          requirements={props.requirements}
          setRequirements={props.setRequirements}
          language={props.language}
          setLanguage={props.setLanguage}
        />

        <StudioCoursePricingFields
          tx={tx}
          price={props.price}
          setPrice={props.setPrice}
          flashSalePrice={props.flashSalePrice}
          setFlashSalePrice={props.setFlashSalePrice}
          flashSaleStartsAt={props.flashSaleStartsAt}
          setFlashSaleStartsAt={props.setFlashSaleStartsAt}
          flashSaleEndsAt={props.flashSaleEndsAt}
          setFlashSaleEndsAt={props.setFlashSaleEndsAt}
        />

        <StudioCourseMediaFields
          tx={tx}
          previewVideoUrl={props.previewVideoUrl}
          setPreviewVideoUrl={props.setPreviewVideoUrl}
          thumbnail={props.thumbnail}
          setThumbnail={props.setThumbnail}
          onPreviewVideoUpload={props.onPreviewVideoUpload}
        />

        <div className="rounded-2xl border border-dashed border-[color:var(--stroke)] bg-white/80 p-4">
          <StudioCoursePublishActions tx={tx} isPublished={props.isPublished} setIsPublished={props.setIsPublished} />
          {isUploadingVideo ? <p className="mt-3 text-xs text-emerald-700">Uploading video...</p> : null}
        </div>
      </form>
    </>
  );
}
