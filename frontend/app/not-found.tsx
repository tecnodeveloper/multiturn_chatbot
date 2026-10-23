import Link from "next/link";
import { Compass, ArrowLeft, LayoutDashboard, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#06080d] text-foreground flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden select-none">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#f5a623]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full flex flex-col items-center text-center">
        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-semibold tracking-wider uppercase border border-[#f5a623]/30 bg-[#f5a623]/10 text-[#f5a623] mb-6 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f5a623] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f5a623]" />
          </span>
          404 &bull; Page Not Found
        </div>

        {/* Decorative Icon Card */}
        <div className="p-5 rounded-3xl bg-card/60 border border-border shadow-xl backdrop-blur-md mb-6 text-[#f5a623] flex items-center justify-center">
          <Compass className="h-12 w-12 stroke-[1.5]" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Page not found
        </h1>

        {/* Subtitle / Explanation */}
        <p className="text-[14px] text-muted-foreground mt-3 max-w-md leading-relaxed">
          The page or analytics route you are looking for does not exist, has been removed, or is temporarily unavailable.
        </p>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full justify-center">
          <Link href="/analytics" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto min-w-[190px] h-11 px-5 rounded-xl bg-[#f5a623] hover:bg-[#e09612] text-[#0f1117] font-semibold text-[13px] shadow-lg shadow-[#f5a623]/20 transition-all duration-150 active:scale-[0.98] gap-2"
            >
              <LineChart className="h-4 w-4" />
              <span>Analytics Overview</span>
            </Button>
          </Link>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto min-w-[150px] h-11 px-5 rounded-xl border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground text-[13px] font-medium transition-colors gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Helpful return link */}
        <div className="mt-8 pt-6 border-t border-border/40 w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#f5a623] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
