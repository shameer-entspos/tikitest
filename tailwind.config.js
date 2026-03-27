/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");
const { nextui } = require("@nextui-org/react");
module.exports = withMT({
  content: [
    // "./app/**/*.{js,ts,jsx,tsx}", // Note the addition of the `app` directory.
    // "./pages/**/*.{js,ts,jsx,tsx}",
    // "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // primary: {
        //   100: "#E6F0FF",
        //   200: "#B3D4FF",
        //   300: "#80B8FF",
        //   400: "#4D9CFF",
        //   500: "#1A80FF",
        //   600: "#0063F7",
        //   700: "#0047CC",
        //   800: "#002D99",
        //   900: "#001A66",
        // },
        secondary: {
          100: "#F7F7F7",
          200: "#E5E5E5",
          300: "#D1D1D1",
          400: "#A6A6A6",
          500: "#7A7A7A",
          600: "#4F4F4F",
          700: "#333333",
          800: "#1F1F1F",
          900: "#141414",
        },
      },
      fontFamily: {
        "Open-Sans": ["Open Sans", "sans-serif"],
      },
      screens: {
        "3xl": "1600px",
        custom: "769px",
      },
      boxShadow: {
        "primary-shadow": "0px 0px 7px 0px #00000033",
        "primary-hover": "0px 0px 7px 0px #0000995d", // Use primary-300/40
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide"), nextui()],
});
