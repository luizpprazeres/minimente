export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center min-h-[calc(100vh-56px)]">
      <h1 className="font-display text-3xl font-semibold text-neutral-800">
        Welcome to miniMENTE
      </h1>
      <p className="max-w-md text-neutral-500">
        Your AI-powered AMC exam preparation platform. Start a study session to begin.
      </p>
      <a
        href="/practice"
        className="rounded-xl bg-cinnamon-500 px-6 py-3 text-sm font-semibold text-white hover:bg-cinnamon-600 transition-colors"
      >
        Start Studying
      </a>
    </div>
  );
}
