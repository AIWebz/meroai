import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" | "lg" }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
        size === "sm" && "px-3.5 py-1.5 text-[13px]",
        size === "md" && "px-5 py-2.5 text-[14px]",
        size === "lg" && "px-7 py-3.5 text-[15px]",
        variant === "primary" && "bg-ink text-paper hover:bg-ink-soft active:scale-[0.98]",
        variant === "secondary" && "bg-transparent text-ink border border-line hover:border-ink hover:bg-paper-dim active:scale-[0.98]",
        variant === "ghost" && "bg-transparent text-ink-soft hover:bg-paper-dim hover:text-ink",
        variant === "danger" && "bg-rose-500 text-white hover:bg-rose-500/90 active:scale-[0.98]",
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]", className)}
      {...props}
    />
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "moss" | "amber" | "rose" | "ink";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-paper-dim text-ink-soft border-line",
    moss: "bg-moss-50 text-moss-700 border-moss-200",
    amber: "bg-[#fbf1de] text-amber-600 border-[#eeddb8]",
    rose: "bg-[#f8ebe9] text-rose-500 border-[#eccfcb]",
    ink: "bg-ink text-paper border-ink",
  };
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function DemoTag({ className }: { className?: string }) {
  return (
    <Badge tone="amber" className={className}>
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Demo
    </Badge>
  );
}

export function StatusDot({ status }: { status: "active" | "idle" | "working" | "paused" }) {
  const map: Record<string, string> = {
    active: "bg-moss-500",
    working: "bg-amber-500 animate-pulse-soft",
    idle: "bg-ink-faint/40",
    paused: "bg-rose-400",
  };
  return <span className={clsx("h-2 w-2 rounded-full", map[status])} />;
}

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-wider text-moss-600">{eyebrow}</p>}
        <h1 className="font-display text-[26px] font-semibold text-ink">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[14.5px] leading-relaxed text-ink-faint">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line px-8 py-14 text-center">
      {icon && <div className="text-ink-faint">{icon}</div>}
      <h3 className="font-display text-[16px] font-semibold text-ink">{title}</h3>
      <p className="max-w-sm text-[13.5px] leading-relaxed text-ink-faint">{description}</p>
      {action}
    </div>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        "w-full resize-none rounded-2xl border border-line bg-surface px-5 py-4 text-[15px] leading-relaxed text-ink placeholder:text-ink-faint/70 outline-none transition-colors focus:border-ink",
        props.className
      )}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint/70 outline-none transition-colors focus:border-ink",
        props.className
      )}
    />
  );
}
