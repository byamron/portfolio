import { lazy, Suspense } from 'react'

const SignatureAnimationInner = lazy(() => import('./SignatureAnimationInner'))

export function SignatureAnimation({ startDelayMs = 0 }: { startDelayMs?: number }) {
  return (
    <Suspense fallback={null}>
      <SignatureAnimationInner startDelayMs={startDelayMs} />
    </Suspense>
  )
}
