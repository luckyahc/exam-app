import { HeaderNav } from "@/components/layout/HeaderNav";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <nav className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <HeaderNav trailing={<ThemeToggle />} />
      </nav>
    </header>
  );
}
