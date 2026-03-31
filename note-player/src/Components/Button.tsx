import { tv } from "tailwind-variants"


type ButtonProps = {
  children: any
  className?: string
  color?: "primary" | "secondary" | "success" | "error"
  onClick?: () => void
  props?: any // dont judge me. I'm in a hurry. 
  disabled?: boolean
}

const buttonVariants = tv({
  base: 'p-1 border border-black hover:bg-green-300 hover:cursor-pointer text-white',
  variants: {
    color: {
      primary: 'bg-white text-black',
      secondary: 'bg-purple-500 text-white',
      success: 'bg-green-600 hover:bg-green-700',
      error: 'bg-red-600 hover:bg-red-700',
    },
    disabled: {
      true: 'opacity-50 bg-gray-500 pointer-events-none'
    }

  }
})

export const Button = ({ children, className, disabled, color = "primary", ...props }: ButtonProps) => {
  return (
    <button disabled={disabled} className={buttonVariants({ color, className, disabled })} {...props} >
      {children}
    </button>
  )
}