import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export const runtime = 'nodejs'

const GEMINI_MODEL = 'gemini-2.5-flash-lite'

function buildPrompt(title: string | undefined, content: string): string {
  const titleSection = title ? `제목: ${title}\n\n` : ''
  return `다음 메모의 내용을 분석하여 관련 태그를 추천해 주세요.

규칙:
- 태그는 5개 이내로 생성합니다.
- 공백 없는 단어 또는 구문(예: "프로젝트", "ReactJS", "할일관리")으로 작성합니다.
- 반드시 JSON 배열 형식으로만 응답합니다. 예: ["태그1", "태그2", "태그3"]
- 다른 설명이나 텍스트는 포함하지 마세요.

${titleSection}내용:
${content}`
}

function parseTagsFromText(text: string): string[] {
  const jsonMatch = text.match(/\[[\s\S]*?\]/)
  if (!jsonMatch) return []

  try {
    const parsed: unknown = JSON.parse(jsonMatch[0])
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item): item is string => typeof item === 'string')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.length <= 30)
      .slice(0, 5)
  } catch {
    return []
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해 주세요.',
      },
      { status: 500 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: '요청 본문을 파싱할 수 없습니다.' },
      { status: 400 },
    )
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json(
      { error: '올바른 JSON 형식이 아닙니다.' },
      { status: 400 },
    )
  }

  const { content, title } = body as Record<string, unknown>

  if (typeof content !== 'string' || content.trim() === '') {
    return NextResponse.json(
      { error: '태그를 생성할 메모 내용이 비어 있습니다.' },
      { status: 400 },
    )
  }

  const titleString =
    typeof title === 'string' && title.trim() ? title.trim() : undefined

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildPrompt(titleString, content.trim()),
    })

    const responseText = response.text

    if (!responseText) {
      return NextResponse.json(
        { error: 'AI가 태그를 생성하지 못했습니다. 다시 시도해 주세요.' },
        { status: 502 },
      )
    }

    const tags = parseTagsFromText(responseText)

    if (tags.length === 0) {
      return NextResponse.json(
        { error: 'AI 응답에서 태그를 추출하지 못했습니다. 다시 시도해 주세요.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('[tags] Gemini API error:', error)

    const message =
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json(
      { error: `Gemini API 호출 실패: ${message}` },
      { status: 502 },
    )
  }
}
