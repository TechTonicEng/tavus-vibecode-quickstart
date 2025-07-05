import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-tess-peach to-tess-yellow text-white hover:from-tess-peach/90 hover:to-tess-yellow/90 hover:scale-105 shadow-lg font-bold",
        secondary: "bg-gradient-to-r from-tess-blue to-tess-purple text-white hover:from-tess-blue/90 hover:to-tess-purple/90 hover:scale-105 shadow-lg font-bold",
        outline: "border-2 border-tess-peach bg-white text-tess-peach hover:bg-tess-peach hover:text-white hover:scale-105 font-bold",
        ghost: "hover:bg-gradient-to-r hover:from-tess-peach/20 hover:to-tess-yellow/20 hover:text-tess-text hover:scale-105",
        destructive: "bg-gradient-to-r from-tess-pink to-tess-peach text-white hover:from-tess-pink/90 hover:to-tess-peach/90 hover:scale-105 shadow-lg font-bold",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-xl px-3 text-sm",
        lg: "h-14 rounded-2xl px-8 text-lg",
        icon: "h-12 w-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };