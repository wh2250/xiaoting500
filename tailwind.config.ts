import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 日系奶油白底
        background: "#FDFCFA",
        card: "#FFFFFF",
        foreground: "rgb(51 47 44 / <alpha-value>)",
        muted: "rgb(139 129 122 / <alpha-value>)",
        line: "rgb(239 231 224 / <alpha-value>)",
        // 珊瑚粉（主色）
        coral: {
          DEFAULT: "#FF8B7B",
          deep: "#E76F5E",
          soft: "#FFF1ED",
          tint: "#FFE3DD",
        },
        // 鼠尾草绿（完成态）
        sage: {
          DEFAULT: "#7FA98A",
          deep: "#5F8A6B",
          soft: "#EEF6EF",
        },
        // 奶油黄（待提交态）
        butter: {
          DEFAULT: "#F3DFB6",
          deep: "#B08A4D",
          soft: "#FBF4E4",
        },
        // 雾霾蓝（辅助）
        mist: {
          DEFAULT: "#7C9CBF",
          soft: "#EEF3F8",
        },
      },
      borderRadius: {
        card: "20px",
        btn: "14px",
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "16px" }],
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro SC",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        // 只用极轻的阴影
        soft: "0 2px 12px rgba(80, 60, 50, 0.04)",
        lift: "0 6px 24px rgba(80, 60, 50, 0.06)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "sheet-up": {
          from: { transform: "translateY(24px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 200ms ease-out both",
        "fade-in": "fade-in 200ms ease-out both",
        "sheet-up": "sheet-up 200ms ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
