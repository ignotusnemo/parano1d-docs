# ParanO(1)d documentation site

The site renders the Markdown documentation maintained in the ParanO(1)d
repository. The copied `content/` directory is the deployable snapshot; the
project documentation remains the source of truth.

```sh
npm install
npm run sync
npm run dev
```

Production checks:

```sh
npm run typecheck
npm run build
npm run build:worker
```

## Mathematical notation

Documentation pages use TeX delimiters in Markdown: `$...$` for inline math
and `$$...$$` for display math. The renderer emits static KaTeX HTML and
MathML during the site build; malformed TeX fails the build.
