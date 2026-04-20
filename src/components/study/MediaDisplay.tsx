import Image from "next/image";
import { type QuestionMediaType } from "@/types/database";
import { cn } from "@/lib/utils";

interface MediaDisplayProps {
  url: string;
  type: QuestionMediaType;
  alt?: string;
  className?: string;
}

const MEDIA_LABELS: Record<QuestionMediaType, string> = {
  none: "",
  ecg: "ECG",
  xray: "X-Ray",
  ct: "CT Scan",
  photo: "Clinical Photo",
};

export function MediaDisplay({ url, type, alt, className }: MediaDisplayProps) {
  if (type === "none") return null;

  return (
    <div className={cn("rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100", className)}>
      {MEDIA_LABELS[type] && (
        <div className="px-3 py-1.5 bg-neutral-200 text-xs font-medium text-neutral-600">
          {MEDIA_LABELS[type]}
        </div>
      )}
      <div className="relative w-full h-32 sm:h-40 md:h-48">
        <Image
          src={url}
          alt={alt ?? MEDIA_LABELS[type]}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </div>
    </div>
  );
}
