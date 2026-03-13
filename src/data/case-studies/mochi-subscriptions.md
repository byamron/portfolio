# Redesigning Mochi's medication subscription experience

## The quick version

Mochi billed patients for monthly medication whether it shipped or not. I rebuilt subscriptions so billing triggers when an order ships, gave patients control over their schedule, and eliminated $200-300k/month in infrastructure costs. Over 90% of patients are on the new model.

## Timeline

Q3 2025 - Q1 2026

## Patients were getting charged for medication that never shipped

Mochi is a telehealth weight loss company where patients subscribe to GLP-1 medications. Every order requires a doctor to review the patient's recent health data and approve it before the pharmacy fulfills it. Billing ran monthly on Stripe's automation — independent of whether any of that actually happened. When everything aligned, it worked. When anything deviated — a missed step, a pharmacy delay, a supply issue — patients kept getting charged for medication that never shipped.

A pharmacy shutdown in spring 2025 made the problem impossible to ignore. Patients went months without medication while charges continued. Fraud claims spiked, churn accelerated, and support was overwhelmed. The outage didn't create the problem. It revealed it.

**VISUAL: Before/after system diagram.** Two timelines running independently (billing fires regardless of fulfillment status) vs. unified model where billing is downstream of order processing.

## Billing triggers when an order ships, not on a calendar

I replaced Stripe's calendar-based scheduling with custom billing logic tied to fulfillment — defining timing rules, states, edge cases, and billing triggers that engineering built to spec. Patients only pay when medication is actually on its way.

This also eliminated $200-300k/month in Stripe subscription automation fees. Over 90% of users have migrated to the new model.

**VISUAL: None needed if section 1's diagram is strong. Make the $200-300k number typographically prominent.**

## Doctors were rejecting orders because of a timing problem, not a data problem

A business decision to stop requiring patients to report weight and side effects before each order — intended to reduce friction — caused doctors to reject 3x more orders. Without recent health data, they couldn't confidently approve medication.

The intuitive fix was to prompt patients to submit their data. It didn't work. Orders were sent to a doctor for approval the moment they were created — seven days before they were scheduled to go to the pharmacy. Patient prompts went out at the same time. Doctors could reject before patients ever responded. This wasn't a compliance problem — it was a timing problem.

I moved the questionnaire earlier in the process. Patients now get prompted 14 days before an order is created, feeding weight and side effects into a persistent progress tracker. By the time a doctor sees an order, the data is already there. I kept the existing patient-facing form intact and routed data to the tracker underneath — infrastructure first, UI migration later.

**VISUAL: Timing diagram showing the race condition and the fix. Two horizontal timelines: (1) broken state where doctor review and patient prompt overlap, (2) fix where data collection starts 14 days ahead.**

## Over 20% of subscription churn was preventable — patients just wanted a break

Rigid 28-day cycles didn't match real patient behavior. If someone wanted to take a break — missed doses, travel, variable dosing — they had to cancel and re-onboard as a new user to restart. Delay and pause was one of our most requested features, and the data backed it up: over 20% of subscription churn was classified as preventable. These were patients who wanted a break, not an exit.

Leadership rejected a true pause — unpredictable revenue and subscription state ambiguity. I designed delay instead: push your next order out up to 3 months, subscription stays active. Delayed revenue rather than full churn. A calendar selector gives patients direct control over their schedule, with send date, estimated ship, and delivery windows updating based on pharmacy turnaround times.

**VISUAL: The delay/scheduling UI. Annotated screenshot of the calendar selector showing how send date, ship estimate, and delivery window relate.**

## The system handles edge cases instead of creating them

Patients can trust that a charge means medication is on its way. Doctors approve orders with real, timestamped data. The billing infrastructure that was costing $200-300k/month is gone, and over 90% of users are on the new model. The health data routing I built here is what gave the progress tracker its strategic importance — that story continues in the next case study.

**VISUAL: None. Clean close.**

## Outcomes

TBD
