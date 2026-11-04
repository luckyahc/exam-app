import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * primary: 먹색으로 채운 주 버튼 — 한 화면에 하나만.
 * secondary: 먹선 테두리 보조 버튼.
 * text: 글자만 있는 링크형 버튼(“이 과목 틀린 문제 7개 →” 같은 한 줄 이동).
 */
export type ButtonVariant = "primary" | "secondary" | "text";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-sumi px-5 text-paper active:opacity-80",
  secondary: "border-[1.5px] border-sumi bg-paper px-5 text-sumi active:bg-paper-deep",
  text: "text-sumi underline-offset-4 hover:underline",
};

type StyleProps = { variant?: ButtonVariant; block?: boolean };

export function buttonClass(
  { variant = "primary", block = false }: StyleProps,
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 text-base font-semibold transition-colors [&>svg]:shrink-0",
    "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
    variant === "text" ? "min-h-11" : "min-h-12",
    VARIANT[variant],
    block && "w-full",
    className,
  );
}

export function Button({
  variant,
  block,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & StyleProps) {
  return <button type={type} className={buttonClass({ variant, block }, className)} {...props} />;
}

export function ButtonLink({
  variant,
  block,
  className,
  ...props
}: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={buttonClass({ variant, block }, className)} {...props} />;
}
