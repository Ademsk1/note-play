import { tv } from "tailwind-variants"


type ButtonProps = {
  children: any
  className: string
  onClick?: () => void
  props?: any // dont judge me. I'm in a hurry. 
}

const buttonVariants = tv({
  base: 'p-1 border border-black hover:bg-green-300 hover:cursor-pointer'
})

export const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <button className={buttonVariants({ className })} {...props} >
      {children}
    </button>
  )
}