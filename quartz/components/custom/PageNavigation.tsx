// quartz/components/PageNavigation.tsx
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import { resolveRelative, simplifySlug } from "../../util/path"

export default (() => {
  const C: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const baseDir = slug.split("/").slice(0, -1).join("/") + "/"

    const siblings = allFiles
      .filter(f => (f.slug ?? "").startsWith(baseDir))
      .sort((a, b) => {
        const an = (a.slug ?? "").split("/").pop() ?? ""
        const bn = (b.slug ?? "").split("/").pop() ?? ""

        const aIntro = an.startsWith("_Introducción") ? -1 : 0
        const bIntro = bn.startsWith("_Introducción") ? -1 : 0
        if (aIntro !== bIntro) return aIntro - bIntro

        const am = an.match(/Bandit-Level-(\d+)/i)
        const bm = bn.match(/Bandit-Level-(\d+)/i)
        const av = am ? parseInt(am[1], 10) : Number.MAX_SAFE_INTEGER
        const bv = bm ? parseInt(bm[1], 10) : Number.MAX_SAFE_INTEGER
        if (av !== bv) return av - bv

        return an.localeCompare(bn)
      })

    const idx = siblings.findIndex(f => f.slug === slug)
    if (idx === -1) return null

    const prev = idx > 0 ? siblings[idx - 1] : undefined
    const next = idx < siblings.length - 1 ? siblings[idx + 1] : undefined

    const toTitle = (s?: string, t?: string) => t ?? (s ? s.split("/").pop() ?? s : "")

    // Trabaja con SimpleSlug para generar URLs realmente relativas
    const from = simplifySlug(fileData.slug!)

    return (
      <div className={classNames(displayClass, "page-navigation")}>
        {prev && (
          <a className="prev" href={resolveRelative(from, simplifySlug(prev.slug!))}>
            <div className="link-title">{toTitle(prev.slug, prev.frontmatter?.title)}</div>
          </a>
        )}
        {next && (
          <a className="next" href={resolveRelative(from, simplifySlug(next.slug!))}>
            <div className="link-title">{toTitle(next.slug, next.frontmatter?.title)}</div>
          </a>
        )}
      </div>
    )
  }

  C.css = `
.page-navigation{display:flex;justify-content:space-between;margin-top:2rem;gap:1rem}
.page-navigation a{display:flex;flex-direction:column;max-width:48%;padding:.8rem 1rem;border:1px solid var(--gray);border-radius:8px;text-decoration:none}
.page-navigation a:hover{border-color:var(--secondary);color:var(--secondary)}
/* Empuja .next a la derecha incluso si es el único botón */
.page-navigation .next{margin-left:auto;text-align:right}
.link-title{margin-top:.25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`
  return C
}) satisfies QuartzComponentConstructor
