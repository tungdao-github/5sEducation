import { redirect } from "next/navigation";

const toSingle = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const email = toSingle(searchParams?.email);
  const token = toSingle(searchParams?.token);
  const query = new URLSearchParams();
  query.set("auth", "reset");
  if (email) query.set("email", email);
  if (token) query.set("token", token);
  redirect(`/?${query.toString()}`);
}
