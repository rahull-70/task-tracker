// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // The key (e.g., 'oi') is the class name you'll use (font-oi)
        // The value must match the variable name in your RootLayout
        oi: ["var(--font-oi)"],
        luckiest: ["var(--font-luckiest-guy)"],
      },
    },
  },
  plugins: [],
};
export default config;