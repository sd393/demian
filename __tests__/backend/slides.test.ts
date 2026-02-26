import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fs/promises
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
  },
  readFile: vi.fn(),
}))

const { mockExtractText } = vi.hoisted(() => {
  const mockExtractText = vi.fn()
  return { mockExtractText }
})

vi.mock('unpdf', () => ({
  extractText: mockExtractText,
}))

import fs from 'fs/promises'
import { extractSlideTexts, extractSlideTextsFromPptx, extractSlideTextsAuto, slidesTempPath, MAX_SLIDES } from '@/backend/slides'

describe('slidesTempPath', () => {
  it('returns a path ending with the given extension', () => {
    const p = slidesTempPath('.pdf')
    expect(p).toMatch(/\.pdf$/)
  })

  it('returns unique paths on each call', () => {
    const p1 = slidesTempPath('.pdf')
    const p2 = slidesTempPath('.pdf')
    expect(p1).not.toBe(p2)
  })
})

describe('extractSlideTexts', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('fake-pdf-bytes'))

    mockExtractText.mockResolvedValue({
      totalPages: 3,
      text: [
        'Heading 1  Content for slide 1',
        'Heading 2  Content for slide 2',
        'Heading 3  Content for slide 3',
      ],
    })
  })

  it('returns text for each page', async () => {
    const slides = await extractSlideTexts('/tmp/test.pdf')
    expect(slides).toHaveLength(3)
    expect(slides[0].slideNumber).toBe(1)
    expect(slides[0].text).toContain('Heading 1')
    expect(slides[2].slideNumber).toBe(3)
  })

  it('calls extractText with mergePages: false', async () => {
    await extractSlideTexts('/tmp/test.pdf')
    expect(mockExtractText).toHaveBeenCalledWith(
      expect.any(Uint8Array),
      { mergePages: false }
    )
  })

  it('fills blank slides with placeholder text', async () => {
    mockExtractText.mockResolvedValue({ totalPages: 1, text: [''] })

    const slides = await extractSlideTexts('/tmp/blank.pdf')
    expect(slides[0].text).toContain('No text')
  })

  it('trims whitespace-only text and uses placeholder', async () => {
    mockExtractText.mockResolvedValue({ totalPages: 1, text: ['   \n  \t  '] })

    const slides = await extractSlideTexts('/tmp/blank.pdf')
    expect(slides[0].text).toContain('No text')
  })

  it('caps at MAX_SLIDES pages', async () => {
    const pages = Array.from({ length: MAX_SLIDES + 5 }, (_, i) => `slide text ${i + 1}`)
    mockExtractText.mockResolvedValue({ totalPages: MAX_SLIDES + 5, text: pages })

    const slides = await extractSlideTexts('/tmp/big.pdf')
    expect(slides).toHaveLength(MAX_SLIDES)
  })

  it('propagates errors from extractText', async () => {
    mockExtractText.mockRejectedValue(new Error('parse error'))

    await expect(extractSlideTexts('/tmp/bad.pdf')).rejects.toThrow('parse error')
  })
})

// --- PPTX extraction tests ---

const { mockLoadAsync } = vi.hoisted(() => {
  const mockLoadAsync = vi.fn()
  return { mockLoadAsync }
})

vi.mock('jszip', () => ({
  default: {
    loadAsync: mockLoadAsync,
  },
}))

function makeSlideXml(texts: string[]): string {
  const paragraphs = texts.map(t => `<a:p><a:r><a:t>${t}</a:t></a:r></a:p>`)
  return `<?xml version="1.0"?><p:sld>${paragraphs.join('')}</p:sld>`
}

function makeMockZip(slides: Record<string, string>) {
  const entries: Record<string, { async: () => Promise<string> }> = {}
  for (const [path, content] of Object.entries(slides)) {
    entries[path] = { async: () => Promise.resolve(content) }
  }
  return {
    forEach: (cb: (path: string, entry: { async: (type: string) => Promise<string> }) => void) => {
      for (const [path, entry] of Object.entries(entries)) {
        cb(path, entry)
      }
    },
  }
}

describe('extractSlideTextsFromPptx', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('fake-pptx-bytes'))
  })

  it('extracts text from PPTX slide XMLs', async () => {
    mockLoadAsync.mockResolvedValue(makeMockZip({
      'ppt/slides/slide1.xml': makeSlideXml(['Title Slide', 'Subtitle']),
      'ppt/slides/slide2.xml': makeSlideXml(['Content Slide']),
    }))

    const slides = await extractSlideTextsFromPptx('/tmp/deck.pptx')
    expect(slides).toHaveLength(2)
    expect(slides[0].slideNumber).toBe(1)
    expect(slides[0].text).toContain('Title Slide')
    expect(slides[0].text).toContain('Subtitle')
    expect(slides[1].text).toContain('Content Slide')
  })

  it('sorts slides by number', async () => {
    mockLoadAsync.mockResolvedValue(makeMockZip({
      'ppt/slides/slide3.xml': makeSlideXml(['Third']),
      'ppt/slides/slide1.xml': makeSlideXml(['First']),
      'ppt/slides/slide2.xml': makeSlideXml(['Second']),
    }))

    const slides = await extractSlideTextsFromPptx('/tmp/deck.pptx')
    expect(slides[0].text).toContain('First')
    expect(slides[1].text).toContain('Second')
    expect(slides[2].text).toContain('Third')
  })

  it('uses placeholder for slides with no text', async () => {
    mockLoadAsync.mockResolvedValue(makeMockZip({
      'ppt/slides/slide1.xml': '<?xml version="1.0"?><p:sld><p:cSld></p:cSld></p:sld>',
    }))

    const slides = await extractSlideTextsFromPptx('/tmp/deck.pptx')
    expect(slides[0].text).toContain('No text')
  })

  it('ignores non-slide entries in the zip', async () => {
    mockLoadAsync.mockResolvedValue(makeMockZip({
      'ppt/slides/slide1.xml': makeSlideXml(['Content']),
      'ppt/slideMasters/slideMaster1.xml': makeSlideXml(['Master']),
      'ppt/slideLayouts/slideLayout1.xml': makeSlideXml(['Layout']),
      '[Content_Types].xml': '<Types/>',
    }))

    const slides = await extractSlideTextsFromPptx('/tmp/deck.pptx')
    expect(slides).toHaveLength(1)
    expect(slides[0].text).toContain('Content')
  })

  it('caps at MAX_SLIDES slides', async () => {
    const entries: Record<string, string> = {}
    for (let i = 1; i <= MAX_SLIDES + 5; i++) {
      entries[`ppt/slides/slide${i}.xml`] = makeSlideXml([`Slide ${i}`])
    }
    mockLoadAsync.mockResolvedValue(makeMockZip(entries))

    const slides = await extractSlideTextsFromPptx('/tmp/big.pptx')
    expect(slides).toHaveLength(MAX_SLIDES)
  })
})

describe('extractSlideTextsAuto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('fake-bytes'))
  })

  it('delegates to PDF extraction for .pdf files', async () => {
    mockExtractText.mockResolvedValue({ totalPages: 1, text: ['PDF content'] })

    const slides = await extractSlideTextsAuto('/tmp/deck.pdf')
    expect(mockExtractText).toHaveBeenCalled()
    expect(slides[0].text).toContain('PDF content')
  })

  it('delegates to PPTX extraction for .pptx files', async () => {
    mockLoadAsync.mockResolvedValue(makeMockZip({
      'ppt/slides/slide1.xml': makeSlideXml(['PPTX content']),
    }))

    const slides = await extractSlideTextsAuto('/tmp/deck.pptx')
    expect(mockLoadAsync).toHaveBeenCalled()
    expect(slides[0].text).toContain('PPTX content')
  })
})
