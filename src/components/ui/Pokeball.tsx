import { useState } from 'react';

interface PokeballProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rotationDegrees?: number;
  hoverScale?: number;
  endlessSpin?: boolean;
  spinSpeed?: number;
  className?: string;
}

export default function Pokeball({
  size = 'sm',
  rotationDegrees = 45,
  hoverScale = 1.3,
  endlessSpin = false,
  spinSpeed = 2,
  className = '',
}: PokeballProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-8 h-8',
      highlight: {
        top: 'top-0.5 left-1 w-2 h-1',
        bottom: 'bottom-0.5 right-1 w-1.5 h-0.5',
      },
      band: 'h-0.5',
      blackCircle: 'w-2.5 h-2.5',
      grayRing: 'w-1.5 h-1.5',
      centerButton: 'w-1 h-1',
    },
    md: {
      container: 'w-12 h-12',
      highlight: {
        top: 'top-1 left-1.5 w-3 h-1.5',
        bottom: 'bottom-1 right-1.5 w-2 h-1',
      },
      band: 'h-1',
      blackCircle: 'w-4 h-4',
      grayRing: 'w-2.5 h-2.5',
      centerButton: 'w-1.5 h-1.5',
    },
    lg: {
      container: 'w-16 h-16',
      highlight: {
        top: 'top-1 left-2 w-4 h-2',
        bottom: 'bottom-1 right-2 w-3 h-1',
      },
      band: 'h-1',
      blackCircle: 'w-5 h-5',
      grayRing: 'w-3 h-3',
      centerButton: 'w-2 h-2',
    },
    xl: {
      container: 'w-20 h-20',
      highlight: {
        top: 'top-1.5 left-2.5 w-5 h-2.5',
        bottom: 'bottom-1.5 right-2.5 w-4 h-1.5',
      },
      band: 'h-1.5',
      blackCircle: 'w-6 h-6',
      grayRing: 'w-4 h-4',
      centerButton: 'w-2.5 h-2.5',
    },
  };

  const config = sizeConfig[size];

  // Generate animation duration class based on spinSpeed
  const getSpinDuration = () => {
    if (spinSpeed <= 1) return 'duration-1000';
    if (spinSpeed <= 1.5) return 'duration-700';
    if (spinSpeed <= 2) return 'duration-500';
    if (spinSpeed <= 3) return 'duration-300';
    return 'duration-200';
  };

  // Build container classes
  const containerClasses = [
    config.container,
    'rounded-full relative overflow-hidden group cursor-pointer',
    endlessSpin ? `animate-spin ${getSpinDuration()}` : 'transition-all duration-300',
    endlessSpin && isHovered ? `scale-${Math.round(hoverScale * 100)}` : '',
    !endlessSpin && isHovered
      ? `scale-${Math.round(hoverScale * 100)} rotate-${rotationDegrees}`
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Build gradient layer classes (counter-rotation for endlessSpin)
  const gradientLayerClasses = endlessSpin
    ? `animate-spin ${getSpinDuration()} [animation-direction:reverse]`
    : '';

  // Build scale wrapper classes for endlessSpin hover
  const scaleWrapperClasses = endlessSpin
    ? `transition-transform duration-300 ${isHovered ? `scale-${Math.round(hoverScale * 100)}` : 'scale-100'}`
    : '';

  // Event handlers
  const eventHandlers = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  const content = (
    <div className={containerClasses} {...eventHandlers}>
      {/* Top Red Half */}
      <div
        className={`absolute top-0 left-0 w-full h-1/2 rounded-t-full shadow-inner ${
          endlessSpin ? 'bg-red-500' : 'bg-gradient-to-b from-red-400 via-red-500 to-red-700'
        }`}
      />

      {/* Bottom Silver/White Half */}
      <div
        className={`absolute bottom-0 left-0 w-full h-1/2 rounded-b-full shadow-inner ${
          endlessSpin ? 'bg-gray-200' : 'bg-gradient-to-t from-gray-300 via-gray-100 to-white'
        }`}
      />

      {/* Center black band */}
      <div
        className={`absolute top-1/2 left-0 w-full ${config.band} bg-gradient-to-r from-gray-900 via-black to-gray-900 transform -translate-y-1/2`}
      />

      {/* Black circle */}
      <div
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${config.blackCircle} bg-black rounded-full`}
      >
        {/* Gray ring inside the black circle */}
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
            config.grayRing
          } rounded-full ${
            endlessSpin ? 'bg-gray-300' : 'bg-gradient-to-br from-gray-100 via-gray-300 to-gray-400'
          }`}
        >
          {/* Inner center button */}
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
              config.centerButton
            } rounded-full transition-all duration-200 delay-300 ${
              endlessSpin
                ? 'bg-gray-300 group-hover:bg-red-400'
                : 'bg-gradient-to-br from-gray-100 via-gray-300 to-gray-400 group-hover:from-red-300 group-hover:via-red-400 group-hover:to-red-600'
            }`}
          />
        </div>
      </div>

      {/* Fixed gradient layer (counter-rotates to stay in place) */}
      <div className={`absolute inset-0 pointer-events-none ${gradientLayerClasses}`}>
        {/* Independent lighting overlay when spinning */}
        {endlessSpin && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-transparent to-black opacity-30" />
        )}

        {/* Red highlight for 3D effect */}
        <div
          className={`absolute ${config.highlight.top} bg-gradient-to-br from-red-200 to-transparent rounded-full opacity-60`}
        />

        {/* Bottom metallic highlight */}
        <div
          className={`absolute ${config.highlight.bottom} bg-gradient-to-bl from-white to-transparent rounded-full opacity-80`}
        />

        {/* Center gray ring gradient overlay */}
        {endlessSpin && (
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${config.blackCircle} pointer-events-none`}
          >
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${config.grayRing} bg-gradient-to-br from-gray-100 via-gray-300 to-gray-400 rounded-full`}
            >
              {/* Center button gradient overlay - turns red on hover */}
              <div
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                  config.centerButton
                } rounded-full transition-all duration-200 delay-300 ${
                  endlessSpin
                    ? 'bg-gray-300 group-hover:bg-red-400'
                    : 'bg-gradient-to-br from-gray-100 via-gray-300 to-gray-400 group-hover:from-red-300 group-hover:via-red-400 group-hover:to-red-600'
                }`}
              />
            </div>
          </div>
        )}

        {/* Overall sphere shadow for depth */}
        <div className="absolute inset-0 rounded-full shadow-inner bg-gradient-to-br from-transparent via-transparent to-black opacity-20" />
      </div>
    </div>
  );
  // Wrap with scale div only for endlessSpin
  return endlessSpin ? <div className={scaleWrapperClasses}>{content}</div> : content;
}
