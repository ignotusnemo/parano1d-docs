# Parano1d documentation site

The site renders the Markdown documentation maintained in the Parano1d
repository. The copied `content/` directory is the deployable snapshot; the
project documentation remains the source of truth.

The site generator maps owned GitHub links to their Forgejo equivalents,
preserving file paths, pinned commits and anchors without changing the upstream
Markdown snapshot. The Source selector opens Forgejo; GitHub remains disabled
while public access is unavailable. Third-party research citations are unchanged.

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
