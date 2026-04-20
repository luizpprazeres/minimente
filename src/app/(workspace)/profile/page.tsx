import { User } from "lucide-react";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cinnamon-100">
        <User className="h-7 w-7 text-cinnamon-500" />
      </div>
      <div>
        <h1 className="font-display text-2xl font-semibold text-neutral-800">
          Profile <span className="text-neutral-400 text-lg">/ Perfil</span>
        </h1>
        <p className="mt-2 text-sm text-neutral-500 max-w-xs mx-auto">
          Profile settings are coming soon.
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          Configurações de perfil estão chegando em breve.
        </p>
      </div>
    </div>
  );
}
