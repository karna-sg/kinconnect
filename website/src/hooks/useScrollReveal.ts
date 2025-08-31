'use client'

import { useEffect, useRef, useState } from 'react'

interface UseScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true
  } = options

  const elementRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce])

  return { elementRef, isVisible }
}

export function useStaggeredReveal(itemCount: number, staggerDelay: number = 100) {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const { elementRef, isVisible } = useScrollReveal()

  useEffect(() => {
    if (isVisible && visibleItems.length === 0) {
      // Stagger the reveal of items
      for (let i = 0; i < itemCount; i++) {
        setTimeout(() => {
          setVisibleItems(prev => [...prev, i])
        }, i * staggerDelay)
      }
    }
  }, [isVisible, itemCount, staggerDelay, visibleItems.length])

  return { elementRef, visibleItems, isVisible }
}