import { cn } from '@/lib/utils';

interface VinsaAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  isThinking?: boolean;
  className?: string;
}

export function VinsaAvatar({ size = 'md', isThinking = false, className }: VinsaAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl flex items-center justify-center',
        sizeClasses[size],
        isThinking ? 'animate-pulse-glow' : 'vinsa-glow',
        className
      )}
    >
      {/* Hexagonal AI Head */}
      <svg
        viewBox="0 0 100 100"
        className={cn('w-full h-full', isThinking && 'animate-thinking')}
      >
        <defs>
          <linearGradient id="vinsaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(187, 100%, 50%)" />
            <stop offset="100%" stopColor="hsl(270, 70%, 60%)" />
          </linearGradient>
          <linearGradient id="vinsaGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(187, 100%, 60%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(270, 70%, 70%)" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer hexagon */}
        <polygon
          points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
          fill="none"
          stroke="url(#vinsaGradient)"
          strokeWidth="3"
          filter="url(#glow)"
        />

        {/* Inner hexagon */}
        <polygon
          points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5"
          fill="url(#vinsaGradient)"
          opacity="0.2"
        />

        {/* Central AI eye */}
        <circle
          cx="50"
          cy="50"
          r="15"
          fill="none"
          stroke="url(#vinsaGlow)"
          strokeWidth="2"
          filter="url(#glow)"
        />
        
        {/* Eye core */}
        <circle
          cx="50"
          cy="50"
          r="8"
          fill="url(#vinsaGradient)"
          className={isThinking ? 'animate-pulse' : ''}
        />

        {/* Circuit lines */}
        <line x1="35" y1="35" x2="25" y2="25" stroke="url(#vinsaGradient)" strokeWidth="1.5" opacity="0.6" />
        <line x1="65" y1="35" x2="75" y2="25" stroke="url(#vinsaGradient)" strokeWidth="1.5" opacity="0.6" />
        <line x1="35" y1="65" x2="25" y2="75" stroke="url(#vinsaGradient)" strokeWidth="1.5" opacity="0.6" />
        <line x1="65" y1="65" x2="75" y2="75" stroke="url(#vinsaGradient)" strokeWidth="1.5" opacity="0.6" />

        {/* Corner nodes */}
        <circle cx="25" cy="25" r="3" fill="url(#vinsaGradient)" />
        <circle cx="75" cy="25" r="3" fill="url(#vinsaGradient)" />
        <circle cx="25" cy="75" r="3" fill="url(#vinsaGradient)" />
        <circle cx="75" cy="75" r="3" fill="url(#vinsaGradient)" />
      </svg>

      {/* Thinking indicator */}
      {isThinking && (
        <div className="absolute -bottom-1 -right-1 flex gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-vinsa-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-vinsa-purple animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-vinsa-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </div>
  );
}
