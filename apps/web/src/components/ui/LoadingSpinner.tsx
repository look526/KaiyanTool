export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const SIZE_CONFIG = {
  small: {
    width: '16px',
    height: '16px',
    strokeWidth: 2,
  },
  medium: {
    width: '24px',
    height: '24px',
    strokeWidth: 2,
  },
  large: {
    width: '32px',
    height: '32px',
    strokeWidth: 2,
  },
};

export function LoadingSpinner({ size = 'medium', color = 'var(--accent)', className }: LoadingSpinnerProps) {
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <svg
      className={className}
      width={sizeConfig.width}
      height={sizeConfig.height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12"
        stroke={color}
        strokeWidth={sizeConfig.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
      <path
        d="M12 2C15.866 2 19 5.13401 19 9"
        stroke={color}
        strokeWidth={sizeConfig.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
