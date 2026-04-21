import { redirect } from "next/navigation";

const toSingle = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

export default function ConfirmEmailPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const userId = toSingle(searchParams?.userId);
  const token = toSingle(searchParams?.token);
  const query = new URLSearchParams();
  query.set("auth", "confirm-email");
  if (userId) query.set("userId", userId);
  if (token) query.set("token", token);
  redirect(`/?${query.toString()}`);
}
