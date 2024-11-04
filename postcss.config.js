import autoprefixer from "autoprefixer";

import tailwindcss from "tailwindcss";

const materialVariables = () => ({
  postcssPlugin: "material-variables",
  Declaration(decl) {
    if (decl.variable && decl.prop.startsWith("--md-") && decl.value.startsWith("rgb(")) {
      decl.value = decl.value.slice(4, -1);
    }
  }
});

materialVariables.postcss = true;

export default {
  plugins: [materialVariables, tailwindcss, autoprefixer]
};
