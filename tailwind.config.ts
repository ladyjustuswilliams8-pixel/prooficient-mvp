import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        proofNavy: "#080c1e",
        proofCard: "#141c3a",
        proofTeal: "#00e0c6",
        proofViolet: "#7a5cff",
        proofMuted: "#a5aecd"
      }
    },
  },
  plugins: [],
};

export default config;
