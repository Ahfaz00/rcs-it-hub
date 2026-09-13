import { BatteryCharging, Cpu, HardDrive, Keyboard, Monitor, ShieldCheck, Wifi, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

const CHECKS = [
  { icon: Cpu, title: "Motherboard & chipset", text: "Board, CPU, chipset and thermals bench-tested under load." },
  { icon: BatteryCharging, title: "Battery & charging", text: "Battery health and charging behaviour recorded on the listing." },
  { icon: Monitor, title: "Display panel", text: "Panel checked for dead pixels, spots, backlight and hinges." },
  { icon: Keyboard, title: "Keyboard & trackpad", text: "Every key, trackpad gesture and button physically tested." },
  { icon: HardDrive, title: "Memory & storage", text: "RAM and SSD/HDD health scanned and data securely wiped." },
  { icon: Wifi, title: "Ports & wireless", text: "USB, HDMI, audio, LAN, Wi-Fi, Bluetooth and webcam verified." },
];

const GRADES = [
  { grade: "Grade A+", text: "Near-new look. Minimal to no visible marks on body or screen." },
  { grade: "Grade A", text: "Light cosmetic wear from normal office use. Fully functional." },
  { grade: "Grade B", text: "Visible scuffs or marks on the body. Functionally tested and working." },
];

export function QualityPromise({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 sm:p-7", className)}>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <p className="text-eyebrow text-primary">Quality check</p>
          <p className="mt-1 font-display text-[1.05rem] font-bold sm:text-[1.25rem]">
            Multi-point testing on every unit
          </p>
        </div>
      </div>

      <div className={cn("mt-6 grid gap-4", compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
        {CHECKS.map((c) => (
          <div key={c.title} className="flex gap-3">
            <c.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-[0.88rem] font-bold">{c.title}</p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-muted-foreground">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7 border-t border-border pt-6">
        <p className="flex items-center gap-2 text-[0.82rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <Wrench className="h-4 w-4 text-primary" /> What the grades mean
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          {GRADES.map((g) => (
            <div key={g.grade} className="rounded-xl border border-border bg-surface p-4">
              <dt className="text-[0.85rem] font-bold">{g.grade}</dt>
              <dd className="mt-1 text-[0.78rem] leading-relaxed text-muted-foreground">{g.text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-[0.75rem] leading-relaxed text-muted-foreground">
          Exact condition, battery status and warranty for a specific unit are confirmed on enquiry before dispatch.
        </p>
      </div>
    </div>
  );
}
