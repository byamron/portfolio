import { lazy, Suspense } from 'react'

const SignatureAnimationInner = lazy(() => import('./SignatureAnimationInner'))

export function SignatureAnimation() {
  return (
    <Suspense fallback={null}>
      <SignatureAnimationInner />
    </Suspense>
  )
}
