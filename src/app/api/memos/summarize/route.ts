import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export const runtime = 'nodejs'

const GEMINI_MODEL = 'gemini-2.5-flash-lite'

function buildPrompt(title: string | undefined, content: string): string {
  const titleSection = title ? `제목: ${title}\n\n` : ''
  return `다음 메모를 핵심 내용 중심으로 한국어 3줄 이내로 요약해 주세요.
원문에 없는 내용은 추가하지 마세요.
할 일이나 결정사항이 있으면 간단히 포함해 주세요.

${titleSection}내용:
${content}

요약:`
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
      { error: '요약할 메모 내용이 비어 있습니다.' },
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

    const summary = response.text

    if (!summary) {
      return NextResponse.json(
        { error: 'AI가 요약을 생성하지 못했습니다. 다시 시도해 주세요.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ summary: summary.trim() })
  } catch (error) {
    console.error('[summarize] Gemini API error:', error)

    const message =
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json(
      { error: `Gemini API 호출 실패: ${message}` },
      { status: 502 },
    )
  }
}
