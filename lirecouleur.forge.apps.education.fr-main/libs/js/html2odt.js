/**
 * code généré par ChatGPT
 */

async function generateOdtFromHtml (html) {
  const zip = new JSZip()

  // 1. mimetype (doit être en premier et non compressé)
  zip.file('mimetype', 'application/vnd.oasis.opendocument.text', {
    compression: 'STORE'
  })

  // 2. META-INF/manifest.xml
  zip.file('META-INF/manifest.xml', generateManifest())

  // 3. styles.xml
  zip.file('styles.xml', generateStylesXml())

  // 4. meta.xml
  zip.file('meta.xml', generateMetaXml())

  // 5. content.xml (gros morceau, avec transformation HTML → ODT XML)
  let pendingImages = [];

  const contentXml = await generateContentXmlFromHtml(html, pendingImages);

  // Ajouter les images dans le dossier Pictures/
  for (const img of pendingImages) {
    try {
      const response = await fetch(img.src);
      const blob = await response.blob();
      zip.file(img.fileName, blob);
    } catch (_) {}
  }
  zip.file('content.xml', contentXml)

  // 6. Télécharger
  const blob = await zip.generateAsync({ type: 'blob' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'document.odt'
  a.click()
}

function generateManifest () {
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">
  <manifest:file-entry manifest:media-type="application/vnd.oasis.opendocument.text" manifest:full-path="/"/>
  <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="content.xml"/>
  <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="styles.xml"/>
  <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="meta.xml"/>
</manifest:manifest>`
}

function generateMetaXml () {
  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  office:version="1.2">
  <office:meta>
    <meta:generator>ChatGPT ODT Generator</meta:generator>
    <meta:creation-date>${new Date().toISOString()}</meta:creation-date>
  </office:meta>
</office:document-meta>`
}

function generateStylesXml () {
  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  office:version="1.2">
  <office:styles/>
</office:document-styles>`
}

function generateContentXmlFromHtml (html, pendingImages) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const styles = new Map()
  let styleCounter = 1

  function escapeXml (text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  function createStyle (styleObj) {
    const key = JSON.stringify(styleObj)
    if (styles.has(key)) return styles.get(key)
    const styleName = `T${styleCounter++}`
    styles.set(key, styleName)
    return styleName
  }

  function buildStyleXml () {
    return Array.from(styles.entries())
      .map(([styleObj, name]) => {
        const s = JSON.parse(styleObj)
        let attrs = ''
        if (s.color) attrs += ` fo:color="${s.color}"`
        if (s['font-weight'] === 'bold') attrs += ` fo:font-weight="bold"`
        if (s['font-style'] === 'italic') attrs += ` fo:font-style="italic"`
        return `<style:style style:name="${name}" style:family="text"><style:text-properties${attrs}/></style:style>`
      })
      .join('\n')
  }

  function processNode (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeXml(node.textContent)
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase()
      const children = Array.from(node.childNodes).map(processNode).join('')
      let imageCounter = 1;

      const styleObj = {}
      if (node.hasAttribute('style')) {
        node
          .getAttribute('style')
          .split(';')
          .forEach(decl => {
            const [k, v] = decl.split(':')
            if (k && v) styleObj[k.trim()] = v.trim()
          })
      }

      const styleName = Object.keys(styleObj).length
        ? createStyle(styleObj)
        : null

      switch (tag) {
        case 'strong':
          return `<text:span text:style-name="Tbold">${children}</text:span>`
        case 'em':
          return `<text:span text:style-name="Titalic">${children}</text:span>`
        case 'h1':
          return `<text:h text:outline-level="1">${children}</text:h>`
        case 'h2':
          return `<text:h text:outline-level="2">${children}</text:h>`
        case 'h3':
          return `<text:h text:outline-level="3">${children}</text:h>`
        case 'h4':
          return `<text:h text:outline-level="4">${children}</text:h>`
        case 'ul':
          return children
        case 'li':
          return `<text:list><text:list-item><text:p>${children}</text:p></text:list-item></text:list>`
        case 'table':
          return `<table:table>${children}</table:table>`
        case 'tr':
          return `<table:table-row>${children}</table:table-row>`
        case 'td':
          return `<table:table-cell><text:p>${children}</text:p></table:table-cell>`
        case 'br':
          return `<text:line-break/>`
        case 'p':
          return `<text:p text:style-name="Standard">${children}</text:p>`
        case 'a':
          const href = node.getAttribute('href')
          if (href) {
            return `<text:a xlink:href="${href}" xlink:type="simple">${children}</text:a>`
          }
          return children
        case 'img':
          const src = node.getAttribute('src')
          if (!src) return ''

          const imgId = `img${imageCounter++}`
          const ext = src.split('.').pop().split('?')[0].toLowerCase() // crude extension
          const fileName = `Pictures/${imgId}.${ext}`

          pendingImages.push({ src, fileName })

          return `
          <draw:frame draw:name="${imgId}" text:anchor-type="as-char" svg:width="4cm" svg:height="3cm">
            <draw:image xlink:href="${fileName}" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad"/>
          </draw:frame>`

        case 'span':
          const classAttr = node.getAttribute('class') || ''
          if (classAttr.includes('_t_') && classAttr.includes('mot')) {
            // On ignore cette balise span, on garde juste les enfants
            return children
          }
          return styleName
            ? `<text:span text:style-name="${styleName}">${children}</text:span>`
            : children

        default:
          return children
      }
    }

    return ''
  }

  const contentBody = Array.from(doc.body.childNodes)
    .map(processNode)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
  xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"
  office:version="1.2">

  <office:automatic-styles>
  	<style:style style:name="Standard" style:family="paragraph" style:class="text">
      <style:paragraph-properties fo:margin-top="0cm" fo:margin-bottom="0.2cm"  fo:line-height="150%"/>
			<style:text-properties style:font-name="Arial" fo:font-family="Arial" style:font-style-name="Normal" style:font-pitch="variable" fo:font-size="14pt"/>
		</style:style>

    <style:default-style style:name="P1" style:family="paragraph">
      <style:paragraph-properties fo:margin-top="0cm" fo:margin-bottom="0.2cm" fo:line-height="150%"/>
      <style:text-properties fo:font-size="14pt" style:font-name="Arial" fo:font-family="Arial"/>
    </style:default-style>

    <style:style style:name="Tbold" style:family="text">
      <style:text-properties fo:font-weight="bold"/>
    </style:style>

    <style:style style:name="Titalic" style:family="text">
      <style:text-properties fo:font-style="italic"/>
    </style:style>

    ${buildStyleXml()}
  </office:automatic-styles>

  <office:body>
    <office:text>
      ${contentBody}
    </office:text>
  </office:body>
</office:document-content>`
}

function htmlExportToOdt (contenu) {
  generateOdtFromHtml(document.getElementById(contenu).innerHTML)
}

function htmlPrintToOdt() {
  const printWindow = window.open("", "_blank", "width=800,height=600");

  // Copier le head + styles nécessaires
  const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map(el => el.outerHTML)
    .join("\n");

  const printable = document.body.cloneNode(true);

  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        ${styles}
      </head>
      <body>${printable.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();

  printWindow.onload = async () => {
    // Optionnel : attendre un petit délai pour les images, styles, etc.
    await new Promise(r => setTimeout(r, 500));

    // Récupérer le HTML visible (comme pour impression)
    const printableHtml = printWindow.document.body.innerHTML;

    // Appel à ta fonction de génération de ODT
    generateOdtFromHtml(printableHtml);

    printWindow.close();
  };
}
