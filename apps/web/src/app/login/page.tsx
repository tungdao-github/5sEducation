import { redirect } from "next/navigation";

const toSingle = (value: string | string[] | undefined, fallback: string) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : fallback;

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const nextPath = toSingle(searchParams?.next, "/my-learning");
  redirect(`/?auth=login&next=${encodeURIComponent(nextPath)}`);
}
