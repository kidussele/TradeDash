"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

import { useTheme } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export const themes = [
  {
    name: "default",
    label: "Default",
    color: "hsl(262.1 83.3% 57.8%)",
  },
  {
    name: "blue",
    label: "Blue",
    color: "hsl(217 91% 60%)",
  },
]

export function useAppTheme() {
  const { theme, setTheme, ...rest } = useTheme()

  const [colorTheme, rawSetColorTheme] = React.useState(() => {
    if (typeof window === "undefined") return "default"
    const t = localStorage.getItem("color-theme") ?? "default"
    return t
  })

  React.useEffect(() => {
    const root = window.document.documentElement
    for (const t of themes) {
      root.classList.remove(`theme-${t.name}`)
    }
    root.classList.add(`theme-${colorTheme}`)
    localStorage.setItem("color-theme", colorTheme)
  }, [colorTheme])

  const setColorTheme = (themeName: string) => {
    rawSetColorTheme(themeName)
  }

  return {
    theme: theme, // light or dark
    setTheme, // function to set light or dark
    colorTheme, // e.g. 'default', 'blue'
    setColorTheme, // function to set color theme
    ...rest,
  }
}
