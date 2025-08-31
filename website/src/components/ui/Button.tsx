'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
  loading?: boolean
  icon?: ReactNode
}

const buttonVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -1 },
  tap: { scale: 0.98, y: 0 }
}

const loadingVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading = false,
  icon,
  ...props
}: ButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-semibold
    border-none cursor-pointer transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variantClasses = {
    primary: 'btn-primary focus:ring-blue-500',
    secondary: 'btn-secondary focus:ring-orange-500',
    outline: `
      bg-transparent border-2 border-blue-600 text-blue-600
      hover:bg-blue-600 hover:text-white focus:ring-blue-500
    `,
    ghost: `
      bg-transparent text-gray-600 hover:bg-gray-100
      focus:ring-gray-500
    `
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-xl'
  }

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <motion.button
      className={combinedClasses}
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      disabled={loading}
      {...props}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          variants={loadingVariants}
          animate="animate"
        />
      )}
      {icon && !loading && icon}
      {children}
    </motion.button>
  )
}

// Specialized buttons for common actions
export function CTAButton({ children, ...props }: Omit<ButtonProps, 'variant'>) {
  return (
    <Button variant="primary" size="lg" {...props}>
      {children}
    </Button>
  )
}

export function SecondaryButton({ children, ...props }: Omit<ButtonProps, 'variant'>) {
  return (
    <Button variant="secondary" {...props}>
      {children}
    </Button>
  )
}

export function OutlineButton({ children, ...props }: Omit<ButtonProps, 'variant'>) {
  return (
    <Button variant="outline" {...props}>
      {children}
    </Button>
  )
}