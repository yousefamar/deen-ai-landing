/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.njk", "./index.html", "./privacy/**/*.html"],
  theme: { extend: {} },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/aspect-ratio")],
};
