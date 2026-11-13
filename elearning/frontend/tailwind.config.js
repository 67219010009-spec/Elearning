/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        board: { DEFAULT: '#1F3D36', dark: '#16302A' }, // กระดานดำสีเขียว
        chalk: { DEFAULT: '#F4C542', dark: '#E0B02F' }, // ชอล์กสีเหลือง
        ink: '#17211E',
        mute: '#5B6B66',
        line: '#DDE5E2',
        paper: '#F7F9F8',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'],
        display: ['Mitr', '"IBM Plex Sans Thai"', 'sans-serif'],
      },
    },
  },
};
