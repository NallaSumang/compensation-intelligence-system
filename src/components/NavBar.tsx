import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="font-bold tracking-tight flex items-center space-x-2">
            <span>CompIntel</span>
          </Link>
          <nav className="flex items-center space-x-4 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">
              Dashboard
            </Link>
            <Link href="/compare" className="transition-colors hover:text-foreground/80 text-foreground">
              Compare Salaries
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
