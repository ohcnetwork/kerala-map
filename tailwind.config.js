module.exports = {
  important: true,
  purge: ["./public/**/*.html", "./src/**/*.jsx", "./src/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      fontSize: {
        mobilexs: ".55rem",
        mobile: ".65rem",
        sm2: ".965rem",
      },
      translate: {
        full: "100%",
      },
      width: {
        "27": "7.5rem",
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
