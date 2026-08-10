import { useAppState } from '../state/AppState'
import { Composer } from './Composer'
import { Icon, Logo, type IconName } from './icons'
import { institutionLogos, publisherLogos } from './home/logos'

/** The three starters under the composer. */
const STARTERS: { icon: IconName; label: string; query: string }[] = [
  {
    icon: 'yesNo',
    label: 'Get a Yes / No answer',
    query: 'Does intermittent fasting lead to meaningful long-term weight loss?',
  },
  {
    icon: 'compare',
    label: 'Compare two approaches',
    query: 'SGLT2 inhibitors vs GLP-1 agonists for renal outcomes in type 2 diabetes',
  },
  {
    icon: 'filters',
    label: 'Find studies by method',
    query: 'Large human studies (n > 1,000) examining long-term outcomes of intermittent fasting',
  },
]

/** Each capability, with the queries the artboard uses to demonstrate it. */
const FEATURES: { icon: IconName; title: string; body: string; examples: string[] }[] = [
  {
    icon: 'deep',
    title: 'Automate Literature Review with Deep Search',
    body: 'Turn days of literature review into a few minutes. Consensus Deep Search builds a comprehensive search strategy, expanding key terms, identifying conflicting arguments, and exploring the citation graph.',
    examples: [
      'What are the competing theoretical explanations for the placebo effect in pain management?',
      'Conflicting evidence on SSRIs and suicide risk in adolescents',
      'Historical consensus shifts on hormone replacement therapy',
    ],
  },
  {
    icon: 'stethoscope',
    title: 'Try Medical mode',
    body: 'Narrow your results to the highest-quality medical sources — about 50,000 clinical guidelines and 8M articles from the top 1,000 medical journals for quick, trusted clinical answers.',
    examples: [
      'SGLT2 inhibitors vs GLP-1 agonists for renal outcomes in type 2 diabetes',
      'Guideline-based management of atrial fibrillation with CKD',
      'First-line and second-line treatment for HFrEF with reduced ejection fraction',
    ],
  },
]

const MORE_FEATURES: typeof FEATURES = [
  {
    icon: 'filters',
    title: 'Use filters with natural language',
    body: 'Specify timeframes, populations, designs, and more directly in your prompt — and Consensus automatically applies the right filters for your search.',
    examples: [
      'How has the scientific consensus on dietary fat evolved since the 1990s?',
      'Large human studies (n > 1,000) examining long-term outcomes of intermittent fasting',
      'Research before and after 2020 on online education outcomes',
    ],
  },
  {
    icon: 'sparkle',
    title: 'See where the research agrees',
    body: 'Ask a clear yes-or-no research question and the Consensus Meter instantly shows how much the evidence agrees or disagrees — giving you a fast, visual read on the state of the research.',
    examples: [
      'Does intermittent fasting lead to meaningful long-term weight loss?',
      'Are antidepressants effective for mild depression?',
      'Does social media use increase the risk of depression in adolescents?',
    ],
  },
]

/**
 * Home, following the F20-0 artboard: the composer, then the page that explains
 * what the product does. Every example query is live — clicking one starts the
 * thread it describes, which is the only honest way to render a marketing page
 * inside a working prototype.
 */
export function HomeView() {
  const { startNewThread } = useAppState()

  return (
    <div className="@container scroll-y flex min-w-0 flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-[768px] flex-col px-6 pb-24">
        {/* The hero fills the screen bar the next heading, which is left showing
            on purpose — it is what tells you the page continues. */}
        <section className="flex min-h-[calc(100dvh-140px)] flex-col items-center justify-center">
          <div className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="text-[24px] font-medium leading-[32px] text-ink">Consensus</span>
          </div>
          <h1 className="m-0 mt-4 text-[28px] font-medium leading-[36px] text-ink">
            Research starts here
          </h1>

          <div className="mt-8 w-full">
            <Composer
              placeholder="Ask the research..."
              hideScope
              onSubmit={(segments) => {
                const text = segments
                  .map((s) => (typeof s === 'string' ? s : ''))
                  .join(' ')
                  .trim()
                if (text) startNewThread(text)
              }}
            />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {STARTERS.map((starter) => (
              <button
                key={starter.label}
                type="button"
                className="btn-sm text-muted"
                onClick={() => startNewThread(starter.query)}
              >
                <Icon name={starter.icon} size={14} /> {starter.label}
              </button>
            ))}
          </div>
        </section>

        <Section title="The new standard for academic research">
          <LogoRow logos={publisherLogos} height="h-6" />
          <p className="m-0 mx-auto max-w-[60ch] text-center text-[16px] leading-[24px] text-ink">
            Search and analyze peer-reviewed literature. Consensus draws on 250M+ research papers,
            including licensed full text content from leading publishers.
          </p>
        </Section>

        {FEATURES.map((feature) => (
          <Feature key={feature.title} {...feature} onAsk={startNewThread} />
        ))}

        <Section title="Used daily at top research institutions">
          <LogoRow logos={institutionLogos} height="h-8" columns />
          <p className="m-0 mx-auto max-w-[60ch] text-center text-[16px] leading-[24px] text-ink">
            Over 170 university libraries partner with Consensus to give students and faculty
            access. 10 million researchers, students, and clinicians use Consensus to supercharge
            literature reviews — without sacrificing academic rigor.
          </p>
        </Section>

        {MORE_FEATURES.map((feature) => (
          <Feature key={feature.title} {...feature} onAsk={startNewThread} />
        ))}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14 flex flex-col gap-9 pt-9">
      {/* Rules flank the heading rather than sitting above it, as on the artboard. */}
      <div className="flex items-center gap-6">
        <span className="h-px grow bg-hairline" />
        <h2 className="m-0 shrink-0 text-center text-[18.08px] font-medium leading-[28px] text-ink">
          {title}
        </h2>
        <span className="h-px grow bg-hairline" />
      </div>
      {children}
    </section>
  )
}

function Feature({
  icon,
  title,
  body,
  examples,
  onAsk,
}: {
  icon: IconName
  title: string
  body: string
  examples: string[]
  onAsk: (query: string) => void
}) {
  return (
    <section className="mt-14 border-t border-hairline pt-9">
      <h2 className="m-0 flex items-center gap-2 text-[16px] font-medium leading-[24px] text-ink">
        <Icon name={icon} size={18} className="text-accent-deep" strokeWidth={1.6} />
        {title}
      </h2>
      <p className="m-0 mt-2 text-[16px] leading-[24px] text-ink">{body}</p>

      <div className="mt-5 flex flex-col gap-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onAsk(example)}
            className="flex items-center gap-3 rounded-[10px] bg-rail px-3 py-2.5 text-left
              hover:bg-fill"
          >
            <span className="min-w-0 grow truncate text-[15px] leading-[150%] text-ink">
              {example}
            </span>
            <Icon name="lines" size={15} className="shrink-0 text-faint" strokeWidth={1.6} />
          </button>
        ))}
      </div>
    </section>
  )
}

function LogoRow({
  logos,
  height,
  columns,
}: {
  logos: { name: string; mark: React.ReactNode }[]
  height: string
  columns?: boolean
}) {
  return (
    <div
      className={
        columns
          ? 'grid grid-cols-2 items-center justify-items-center gap-x-6 gap-y-8 @[560px]:grid-cols-4'
          : 'flex flex-wrap items-center justify-center gap-x-9 gap-y-6'
      }
    >
      {logos.map((logo) => (
        <span
          key={logo.name}
          title={logo.name}
          className={`${height} flex max-w-[150px] items-center justify-center text-ink`}
        >
          {logo.mark}
        </span>
      ))}
    </div>
  )
}
