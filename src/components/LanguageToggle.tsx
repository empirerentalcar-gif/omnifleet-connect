import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle = ({ className }: LanguageToggleProps) => {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];

  const setLang = (lng: "en" | "es") => {
    if (current === lng) return;
    void i18n.changeLanguage(lng);
  };

  const baseBtn =
    "px-2.5 py-1 text-xs font-bold rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1adfb0]/60";
  const active = "bg-[#1adfb0] text-[#0d1b2e]";
  const inactive = "text-white/50 hover:text-white";

  return (
    <div
      role="group"
      aria-label={t("language.switchTo")}
      className={cn(
        "inline-flex items-center gap-1 rounded-full p-1 bg-[#0d1b2e] border border-white/10",
        className,
      )}
    >
      <button
        type="button"
        aria-pressed={current === "en"}
        aria-label={t("language.english")}
        onClick={() => setLang("en")}
        className={cn(baseBtn, current === "en" ? active : inactive)}
      >
        EN
      </button>
      <button
        type="button"
        aria-pressed={current === "es"}
        aria-label={t("language.spanish")}
        onClick={() => setLang("es")}
        className={cn(baseBtn, current === "es" ? active : inactive)}
      >
        ES
      </button>
    </div>
  );
};

export default LanguageToggle;
