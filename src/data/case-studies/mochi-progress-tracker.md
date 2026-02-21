# Empowering weight loss through progress tracking

## The quick version

Mochi's progress tracker existed but nobody used it. I drove a 53% increase in weekly active users, then identified its real value — a single source of truth for patient weight data — and built the integration that made it critical to the clinical workflow.

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

Mochi had two separate systems tracking patient weight: the progress tracker (patient-facing, underused) and health checks stored on refills (used for provider review and approval — the key clinical workflow). Health check data powered refill decisions but wasn't saved or surfaced to patients. They filled out health checks every cycle and got nothing back from it. Meanwhile, the progress tracker — built to store and display exactly this kind of data — sat mostly empty because patients had to log separately.

I unified them. Both entry points still work, but data flows to one place. Health check data now automatically populates the progress tracker. Patients get a filled-out progress history without any additional effort. Providers get the timestamped weight and side effect data they need to approve refills. Two redundant systems replaced by one — patients get value from work they were already doing, the provider denial problem is solved, and the backend is significantly simplified.

Tracker usage increased ~60% on top of the previous 53% gain. The number is partly a technicality — data now routes there automatically — but the patient value is real. Their tracker reflects their actual journey without requiring extra effort.

**VISUAL: A simple data flow diagram. Old state: health check data goes to refill review, then disappears; progress tracker sits empty, requires separate logging. New state: both entry points feed one system, serving both the patient view and provider review.**

## The feature nobody would invest in is now infrastructure they can't operate without

With the tracker tied to the clinical workflow, the backend limitations that previously blocked growth are now in planning — flexible data models that could expand to nutrition, labs, and physical activity tracking. Visual refresh proved demand. Integration proved strategic value. Investment followed.

**VISUAL: None. Clean close.**
