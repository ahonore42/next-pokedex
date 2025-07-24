import Button from './Button';
import LinkButton from './LinkButton';

// Type exports from components
export type { ButtonProps } from './Button';
export type { LinkButtonProps } from './LinkButton';

// Separate named LinkButton export for optimal performance
export { LinkButton };

// Default export - standard button for most use cases
export default Button;
