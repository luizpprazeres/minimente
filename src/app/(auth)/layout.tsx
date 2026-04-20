import { authCopy } from "@/lib/copy";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cinnamon-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo + tagline */}
        <div className="text-center mb-8">
          <span className="font-display text-3xl font-semibold text-cinnamon-500">
            mini<span className="text-neutral-800">MENTE</span>
          </span>
          <p className="mt-1 text-sm text-neutral-500">{authCopy.tagline.en}</p>
          <p className="text-xs text-neutral-400">{authCopy.tagline.pt}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
