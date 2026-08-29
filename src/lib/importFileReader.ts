const APPLE_HEALTH_XML_HINT = /HealthData|HKCategoryTypeIdentifierMenstrualFlow/i

function isAppleHealthExportXml(name: string, sample: string): boolean {
  if (/export_cda\.xml$/i.test(name)) return false
  return /\.xml$/i.test(name) && APPLE_HEALTH_XML_HINT.test(sample)
}

async function readZipEntrySample(
  zip: import('jszip'),
  path: string,
  maxBytes = 8192,
): Promise<string> {
  const file = zip.file(path)
  if (!file) return ''
  const buffer = await file.async('uint8array')
  return new TextDecoder('utf-8').decode(buffer.subarray(0, maxBytes))
}

/** Resolve Apple Health export.xml inside a zip (skip export_cda.xml). */
async function extractAppleHealthXmlFromZip(
  zip: import('jszip'),
): Promise<{ text: string; filename: string }> {
  const xmlPaths = Object.keys(zip.files).filter(
    (path) =>
      !zip.files[path].dir &&
      /\.xml$/i.test(path) &&
      !/export_cda\.xml$/i.test(path),
  )

  if (xmlPaths.length === 0) {
    throw new Error('压缩包里没有找到 Apple 健康导出的 XML 文件')
  }

  const bestPath =
    xmlPaths.length === 1
      ? xmlPaths[0]
      : xmlPaths.sort(
          (left, right) =>
            (zip.files[right]?.date?.getTime() ?? 0) -
            (zip.files[left]?.date?.getTime() ?? 0),
        )[0]

  const sample = await readZipEntrySample(zip, bestPath)
  if (!APPLE_HEALTH_XML_HINT.test(sample)) {
    throw new Error('压缩包里的 XML 不是 Apple 健康导出格式')
  }

  const text = await zip.file(bestPath)!.async('string')
  const filename = bestPath.split('/').pop() ?? 'export.xml'
  return { text, filename }
}

export async function readImportFile(
  file: File,
): Promise<{ text: string; filename: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

  if (ext === 'zip') {
    const { default: JSZip } = await import('jszip')
    const zip = await JSZip.loadAsync(file)
    return extractAppleHealthXmlFromZip(zip)
  }

  const text = await file.text()
  if (ext === 'xml' || isAppleHealthExportXml(file.name, text.slice(0, 8192))) {
    return { text, filename: file.name }
  }

  return { text, filename: file.name }
}
