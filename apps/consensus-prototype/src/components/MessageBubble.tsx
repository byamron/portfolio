import type { Message } from '../data/mockData'
import { CitationChip } from './CitationChip'
import { ThreadPill } from './ThreadPill'
import { StepTracer } from './StepTracer'

export function renderSegment(segment: Message['content'][number], key: number) {
  if (typeof segment === 'string') return <span key={key}>{segment}</span>
  if ('citePaperId' in segment) return <CitationChip key={key} paperId={segment.citePaperId} />
  return <ThreadPill key={key} threadId={segment.threadRefId} />
}

export function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bubble-radius max-w-[85%] bg-bubble px-4 py-2.5 text-base leading-6 text-text-primary">
          {message.content.map((segment, i) => renderSegment(segment, i))}
        </div>
      </div>
    )
  }

  return (
    <div className="text-base leading-[150%] text-text-primary">
      {message.steps && <StepTracer steps={message.steps} />}
      {message.content.map((segment, i) => renderSegment(segment, i))}
    </div>
  )
}
