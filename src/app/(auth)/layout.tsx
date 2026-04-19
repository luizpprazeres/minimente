export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cinnamon-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-display text-3xl font-semibold text-cinnamon-500">
            mini<span className="text-neutral-800">MENTE</span>
          </span>
          <p className="mt-1 text-sm text-neutral-500">AMC Exam Preparation</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
