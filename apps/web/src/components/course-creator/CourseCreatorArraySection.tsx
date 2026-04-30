"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/app/providers";

type Props = {
  title: string;
  description: string;
  items: string[];
  placeholderPrefix: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
};

export default function CourseCreatorArraySection({
  title,
  description,
  items,
  placeholderPrefix,
  onAdd,
  onRemove,
  onChange,
}: Props) {
  const { tx } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input placeholder={`${placeholderPrefix} ${index + 1}`} value={item} onChange={(e) => onChange(index, e.target.value)} />
            {index > 0 ? (
              <Button type="button" variant="outline" size="icon" onClick={() => onRemove(index)}>
                <X className="size-4" />
              </Button>
            ) : null}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onAdd}>
          <Plus className="size-4" />
          {tx("Add", "Thêm")}
        </Button>
      </CardContent>
    </Card>
  );
}
