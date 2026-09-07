// Rewrite owned source links when publishing; keep upstream docs and citations intact.
export function sourceLinks(text) {
  return text
    .replace(/https:\/\/github\.com\/ignotusnemo\/([\w.-]+)\/(?:blob|tree)\/([\w.-]+)(?=[/#?\s)"<>]|$)/g,
      (_, repo, ref) => `https://git.parano1d.org/ignotusnemo/${repo}/src/${/^[a-f0-9]{7,40}$/i.test(ref) ? 'commit' : /^v\d/.test(ref) ? 'tag' : 'branch'}/${ref}`)
    .replace(/https:\/\/github\.com\/ignotusnemo(?=[/#?\s)"<>]|$)/g, 'https://git.parano1d.org/ignotusnemo')
    .replace(/(\[[^\]\n]*)GitHub(?=[^\]\n]*\]\(https:\/\/git\.parano1d\.org\/)/g, '$1Forgejo');
}
