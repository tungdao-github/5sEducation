"use client";

type Props = {
  message: string;
};

export default function BlogEmptyState({ message }: Props) {
  return (
    <div className="py-12 text-center">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
