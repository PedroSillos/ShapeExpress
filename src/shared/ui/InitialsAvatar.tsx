import { cn } from '@/src/utils/cn';

interface InitialsAvatarProps {
  name: string;
  /** Tailwind size classes, e.g. "w-10 h-10". Default: "w-10 h-10" */
  sizeClass?: string;
  /** Tailwind rounded class. Default: "rounded-full" */
  roundedClass?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders a colored circle with the first initial of `name`.
 * Used everywhere that previously showed an avatar image.
 */
export function InitialsAvatar({
  name,
  sizeClass = 'w-10 h-10',
  roundedClass = 'rounded-full',
  className,
  style,
}: InitialsAvatarProps) {
  const initial = (name?.trim().charAt(0) ?? '?').toUpperCase();

  return (
    <div
      className={cn(
        sizeClass,
        roundedClass,
        'flex items-center justify-center font-bold text-white bg-brand-red/80 shrink-0',
        className,
      )}
      style={style}
    >
      {initial}
    </div>
  );
}
