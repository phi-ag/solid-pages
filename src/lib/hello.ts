const hello = () => {
  console.log(
    `%cSolid Pages%c
v${import.meta.env.VERSION} ${import.meta.env.REVISION}

Does this page need fixes or improvements? Open an issue or contribute a merge request.

💡 https://github.com/phi-ag/solid-pages
🐞 https://github.com/phi-ag/solid-pages/issues
💌 info@phi.ag`,
    "padding-top: 0.5em; font-size: 2em;",
    "padding-bottom: 0.5em;"
  );
};

export default hello;
