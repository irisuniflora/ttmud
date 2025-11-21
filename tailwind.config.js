/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': '#0a0e27',        // 짙은 남색 배경
        'game-panel': '#1a2332',     // 어두운 파란 회색 패널
        'game-border': '#2d3e5f',    // 파란 회색 테두리
        'common': '#6b7280',         // 회색
        'rare': '#3b82f6',           // 파란색
        'epic': '#a855f7',           // 보라색
        'unique': '#fbbf24',         // 노란색 (유니크)
        'legendary': '#f97316',      // 주황색
        'mythic': '#ef4444',         // 빨간색
        'dark': '#ffffff',           // 흰색 (다크)
      }
    },
  },
  plugins: [],
}
