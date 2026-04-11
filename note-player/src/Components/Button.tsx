import { tv } from 'tailwind-variants';

type ButtonProps = {
  children: string;
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'error';
  onClick?: () => void;
  disabled?: boolean;
  props?: React.ComponentPropsWithRef<'button'>; // dont judge me. I'm in a hurry.
};

const buttonVariants = tv({
  base: 'p-1 border border-black hover:bg-green-300 hover:cursor-pointer text-white inline',
  variants: {
    color: {
      primary: 'bg-white text-black',
      secondary: 'bg-purple-500 text-white',
      success: 'bg-green-600 hover:bg-green-700',
      error: 'bg-red-600 hover:bg-red-700',
    },
    disabled: {
      true: 'opacity-50 bg-gray-500 pointer-events-none',
    },
  },
});

export const Button = ({
  children,
  className,
  disabled,
  color = 'primary',
  ...props
}: ButtonProps) => {
  return (
    <button
      disabled={disabled}
      className={buttonVariants({ color, className, disabled })}
      {...props}
    >
      {children}
    </button>
  );
};
