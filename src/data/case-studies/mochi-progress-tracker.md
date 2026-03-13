# Turning an unused tracker into clinical infrastructure

## The quick version

Mochi's progress tracker existed but nobody used it. I drove a 53% increase in weekly active users, then identified its real value — a single source of truth for patient weight data — and built the integration that made it critical infrastructure.

## Timeline

Q3 2025 - Q1 2026

## Patients wanted to track progress — ours just wasn't good enough

Patients were already tracking weight loss with third-party apps like MyFitnessPal and Lose It!. Only 30% of active Mochi patients had ever logged in ours. The company wanted to invest but couldn't justify it — no connection to revenue, so it kept getting deprioritized. The design reflected it: unclear data visualization, no mobile support, rigid logging that forced all metrics at once.

**VISUAL: None needed, or a brief "before" screenshot. This section is setup — keep it tight.**

## A visual refresh and mobile support drove a 53% increase in weekly active users

I gave the tracker a visual refresh with the new design system and made it work on mobile — where a majority of patients were. I separated logging entry points so patients weren't forced to log weight before anything else, cleaned up the weight graph with goal visualization, and made log history scannable.

53% increase in weekly active users and 57% increase in logging frequency within two weeks. Proof that demand existed — but still not enough to change organizational priority.

**VISUAL: Before/after of the tracker UI. Side by side or stacked — the contrast should be immediately obvious. This is your craft moment.**

## Patients were doing the work — they just weren't getting value from it

Mochi had two separate systems collecting patient weight. The progress tracker was patient-facing but underused. Separately, every time patients reordered medication, they reported weight and side effects as part of the approval process — but that data was stored on the order record, used for the doctor's review, and never surfaced to patients. They were submitting their data every month and getting nothing back. Meanwhile, the tracker sat mostly empty because it required separate logging.

I unified them. Both entry points still work, but data flows to one place. The weight and side-effect data patients submit when reordering now automatically populates their progress tracker. Patients get a complete progress history without extra effort. Doctors get the timestamped data they need to approve orders. Two redundant systems replaced by one — and the backend is significantly simplified.

Tracker usage increased ~60% on top of the previous 53% gain. The number is partly a technicality — data now routes there automatically — but the patient value is real. Their tracker reflects their actual journey without requiring extra effort.

**VISUAL: A simple data flow diagram. Old state: weight data submitted during reordering goes to doctor review, then disappears; progress tracker sits empty, requires separate logging. New state: both entry points feed one system, serving both the patient view and doctor review.**

## The feature nobody would invest in is now infrastructure they can't operate without

With the tracker integrated into the ordering workflow, the backend limitations that previously blocked growth are now in planning — flexible data models that could expand to nutrition, labs, and physical activity tracking. Visual refresh proved demand. Integration proved strategic value. Investment followed.

**VISUAL: None. Clean close.**
