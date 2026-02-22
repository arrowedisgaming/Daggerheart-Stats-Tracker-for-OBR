/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,html}"],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    screens: {
      lg: "400px",
      md: "320px",
    },
    extend: {
      fontSize: {
        "2xs": "0.6rem",
      },
      transitionProperty: {
        height: "height",
        // padding: "padding",
      },
      colors: {
        tracker: {
          light: {
            fuchsia: "rgb(202, 145, 213)",
            pink: "rgb(214, 133, 174)",
            red: "rgb(219, 119, 119)",
            orange: "rgb(214, 142, 104)",
            yellow: "rgb(197, 173, 120)",
            lime: "rgb(158, 174, 142)",
            emerald: "rgb(104, 191, 163)",
            cyan: "rgb(137, 181, 191)",
            blue: "rgb(154, 177, 211)",
          },
          dark: {
            fuchsia: "rgb(124, 66, 145)",
            pink: "rgb(140, 52, 100)",
            red: "rgb(148, 39, 44)",
            orange: "rgb(164, 79, 39)",
            yellow: "rgb(131, 110, 52)",
            lime: "rgb(92, 114, 73)",
            emerald: "rgb(59, 109, 103)",
            cyan: "rgb(74, 115, 132)",
            blue: "rgb(61, 84, 131)",
          },
        },
        default: {
          DEFAULT: "#dde1ee",
          dark: "#222639",
        },
        paper: {
          DEFAULT: "#f1f3f9",
          dark: "#3d4051",
        },
        text: {
          primary: {
            DEFAULT: "rgba(0, 0, 0, 0.87)",
            dark: "rgb(255, 255, 255)",
          },
          secondary: {
            DEFAULT: "rgba(0, 0, 0, 0.6)",
            dark: "rgb(255, 255, 255, 0.7)",
          },
          disabled: {
            DEFAULT: "rgba(0, 0, 0, 0.38)",
            dark: "rgb(255, 255, 255, 0.5)",
          },
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
