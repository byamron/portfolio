# Redesigning Mochi's medication subscription experience

## The quick version

Mochi billed its patients for monthly medication whether it shipped or not. I rebuilt subscriptions so billing triggers when an order is processed, gave patients control over their schedule, and eliminated $200-300k/month in infrastructure costs. 90%+ of patients have been successfully migrated.

## Timeline

Q3 2025 - Q1 2026

## Patients were getting charged for medication that never shipped

Mochi is a telehealth weight loss company where patients subscribe to GLP-1 medications. Billing ran monthly on Stripe's automation, but actually delivering medication required patients to request a refill, confirm details, complete a health check, and verify again. When everything aligned, it worked. When anything deviated — a missed step, a pharmacy delay, a supply issue — patients kept getting charged for medication that never shipped.

A pharmacy shutdown in spring 2025 made the problem impossible to ignore. Patients went months without medication while charges continued. Fraud claims spiked, churn accelerated, and support was overwhelmed. The outage didn't create the problem. It revealed it.

**VISUAL: Before/after system diagram.** Two timelines running independently (billing fires regardless of fulfillment status) vs. unified model where billing is downstream of order processing.

## Billing triggers when an order is processed, not on a calendar

I replaced Stripe's calendar-based scheduling with custom billing logic tied to fulfillment events — defining timing rules, states, edge cases, and billing triggers that engineering built to spec. Patients only pay when medication is actually on its way.

This also eliminated $200-300k/month in Stripe scheduling costs. The service was expensive and structurally wrong for how medication fulfillment works — a lose-lose. Over 90% of users have migrated to the new model.

**VISUAL: None needed if section 1's diagram is strong. Make the $200-300k number typographically prominent.**

## Providers were denying refills because of a timing problem, not a data problem

A business decision to remove required health checks — intended to reduce patient friction — caused provider denial rates to spike 3x. Without recent weight and side effect data, providers couldn't confidently approve refills.

The intuitive fix was to prompt patients to complete health checks. It didn't work. Refills were created 7 days before send and routed to providers immediately. Health check prompts went out at the same time. Providers could deny before patients ever responded. This wasn't a compliance problem — it was a timing problem.

I moved data collection upstream. Scheduled prompts now start 14 days before a refill is created, feeding weight and side effects into a persistent progress tracker. By the time a provider sees a refill request, the data is already there. I kept the existing health check UI intact and routed data to tracker storage underneath — infrastructure first, UI migration later.

**VISUAL: Timing diagram showing the race condition and the fix. Two horizontal timelines: (1) broken state where provider review and patient prompt overlap, (2) fix where data collection starts 14 days ahead.**

## Over 20% of subscription churn was preventable — patients just wanted a break

Rigid 28-day cycles didn't match real patient behavior. If someone wanted to take a break — missed doses, travel, variable dosing — they had to cancel and re-onboard as a new user to restart. Delay and pause was one of our most requested features, and the data backed it up: over 20% of medication subscription churn was classified as preventable. These were patients who wanted a break, not an exit.

Leadership rejected a true pause — unpredictable revenue and subscription state ambiguity. I designed delay instead: push your next order out up to 3 months, subscription stays active. Delayed revenue rather than full churn. A calendar selector gives patients direct control over their order schedule, with send date, estimated ship, and delivery windows updating based on pharmacy partner turnaround times.

**VISUAL: The delay/scheduling UI. Annotated screenshot of the calendar selector showing how send date, ship estimate, and delivery window relate.**

## The system handles edge cases instead of creating them

Patients can trust that a charge means medication is on its way. Providers make refill decisions with real, timestamped data. The billing infrastructure that was costing $200-300k/month is gone, and over 90% of users are on the new model. The health data routing I built here is what gave the progress tracker its strategic importance — that story continues in the next case study.

**VISUAL: None. Clean close.**

## Outcomes

TBD
