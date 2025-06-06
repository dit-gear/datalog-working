type DocumentType = 'email' | 'pdf'

export function insertPoweredBy(html: string, type: DocumentType): string {
  if (type === 'pdf') {
    return html
  }

  // the snippet to inject
  const poweredBy = `<Text style={{
    color: '#6a737d',
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '60px'
  }}>Powered by daytalog</Text>`

  // regex to match the closing body tag (any casing)
  const closingBodyRe = /<\/body>/i

  // if there's no </body>, return original
  if (!closingBodyRe.test(html)) {
    console.warn(`insertPoweredBy: no </Body> tag found for type="${type}"`)
    return html
  }

  // insert poweredBy right before the matched </body>, preserving its casing
  return html.replace(closingBodyRe, (match) => `${poweredBy}${match}`)
}
