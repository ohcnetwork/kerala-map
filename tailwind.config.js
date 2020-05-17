module.exports = {
  important: true,
  purge: ["./public/**/*.html", "./src/**/*.jsx", "./src/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      fontSize: {
        mobilexs: ".35rem",
        mobiles: ".45rem",
        mobile: ".55rem",
        mobilel: ".65rem",
        sm2: ".965rem",
      },
      translate: {
        full: "100%",
      },
      width: {
        "27": "7.5rem",
      },
      colors: {
        dark: {
          100: "#E9E9E9",
          200: "#C8C8C8",
          300: "#A7A7A7",
          400: "#666666",
          500: "#242424",
          600: "#202020",
          700: "#161616",
          800: "#101010",
          900: "#0B0B0B",
        },
        light: {
          100: "#FBFBFB",
          200: "#F4F5F5",
          300: "#EDEEEE",
          400: "#E0E2E2",
          500: "#D2D5D5",
          600: "#BDC0C0",
          700: "#7E8080",
          800: "#5F6060",
          900: "#3F4040",
        },
      },
      opacity: {
        "10": "0.1",
      },
      padding: {
        sm: "0.175rem",
      },
    },

    minWidth: {
      "0": "0",
      "24": "6rem",
      "32": "8rem",
      "1/4": "25%",
      "1/2": "50%",
      "3/4": "75%",
      full: "100%",
    },
  },
  variants: {
    transitionProperty: ["responsive", "hover", "focus"],
    rotate: ["responsive", "hover", "group-hover"],
    scale: ["responsive", "hover", "group-hover"],
  },
  plugins: [],
};
