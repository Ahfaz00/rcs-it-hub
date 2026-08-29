import * as Lucide from "lucide-react";
import type { LucideProps } from "lucide-react";

/** Renders a lucide icon by its name, falling back to a neutral chip icon. */
export function Icon({ name, ...props }: { name?: string | null | undefined } & LucideProps) {
  const registry = Lucide as unknown as Record<string, React.ComponentType<LucideProps>>;
  const Component = (name && registry[name]) || Lucide.Cpu;
  return <Component {...props} />;
}
