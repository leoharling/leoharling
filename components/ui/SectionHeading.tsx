import FadeIn from "./FadeIn";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  className = "",
}: SectionHeadingProps) {
  return (
    <FadeIn className={`mb-12 ${className}`}>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {subtitle}
        </p>
      )}
    </FadeIn>
  );
}
