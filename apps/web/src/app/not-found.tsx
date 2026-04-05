import Link from "next/link";

export default function NotFound() {
  return (
    <div className="section-shell py-20 fade-in">
      <div className="surface-card mx-auto max-w-xl rounded-3xl p-10 text-center">
        <h1 className="section-title text-3xl font-semibold text-emerald-950">Page not found</h1>
        <p className="mt-3 text-sm text-emerald-800/70">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
