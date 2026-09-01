# Backstage v0.18 — Functions & Weddings Command Centre

## Release goal

v0.18 closes the gap between a calendar booking and the detailed operational work required to deliver it. The Function record is the shared operational parent; weddings add deeper specialist planning without becoming a disconnected second CRM.

## Functions command centre

The `/events` route is now labelled **Functions** and provides:

- upcoming operational records;
- priority and missing-detail actions;
- booked value and outstanding balance totals;
- final-meeting visibility;
- event-type, status and text filtering;
- readiness scores;
- links into each detailed Function workspace;
- linked Wedding records in the same operational register.

The demonstration register uses realistic current venue workflows, including Ruth's evening meeting, Julia's conference, Council training, the Christmas Party Night, Claire Loynes' provisional celebration and Lucy & Connor's wedding.

## Function workspace

Each Function has six working areas:

1. **Overview** — next action, readiness gaps, financial position, checklist and output status.
2. **Plan Function** — booking, organiser, room, food, drink, dietaries, AV, entertainment, accommodation and handover notes.
3. **Checklist** — complete existing tasks and create new dated actions.
4. **Running Order** — add, complete and remove timed operational moments.
5. **Payments** — agreed value, paid value, outstanding balance and payment schedule.
6. **Outputs & Integrations** — printable Function Sheet plus the staged integration runway.

Planning adapts to the booking type. Meetings expose delegate-package, registration and AV detail. Parties expose bar, entertainment, cake, décor and lighting. Wedding records link into the specialist Wedding workspace.

## Wedding command centre

The redesigned `/weddings` landing page adds:

- active Wedding, attention, outstanding-balance and ready-to-deliver totals;
- next-milestone actions;
- search and status filters;
- visible readiness progress;
- direct access to the existing guided meetings, pricing, quote, payments, planning, guests, seating, dietaries, running order, function sheet, documents, outputs, live mode and post-event areas.

## Calendar handover

In build mode, a new calendar booking also creates its Function record. Existing booking cards can open the corresponding Function workspace. Confirming or releasing a calendar hold updates that Function's status in the same browser data store.

## Integration staging

The Function workspace visibly reserves the following connections without activating them:

- Stripe Connect for deposits, balances and reconciliation;
- venue email for approved confirmations and reminders;
- OpenAI for drafting, completeness checks and summaries;
- document storage for versioned packs and uploads;
- customer portal for secure planning, messages, documents and payments.

This staging is intentional. Authentication remains off by default while the operational product is built. None of these cards claim a live connection.

## Production schema

Migration `021_functions_weddings_command_centre.sql` adds:

- `event_operations` for the one-to-one operational plan;
- `event_tasks` for role-aware planning actions;
- `event_running_order` for timed delivery;
- `event_payment_schedule` for deposits, invoices and balances;
- tenant-aware RLS policies;
- `save_event_workspace` for transactional workspace updates and audit activity.

All tables retain organisation, venue and event ownership. The save operation starts from an event already visible under RLS and does not accept browser-supplied venue identity.

## Authentication decision

Authentication can be configured later and will be needed for real staff roles, live customer portals, payment ownership and audit identity. It is not required to develop or review v0.18.

Keep:

```env
NEXT_PUBLIC_BACKSTAGE_BUILD_MODE=true
```

At the launch-readiness checkpoint, configure Supabase, apply migrations `001` through `021`, seed the first organisation/venue/membership, then explicitly set build mode to `false`.

## Still intentionally later

- live Stripe Connect onboarding;
- authenticated customer invitations;
- real email delivery;
- OpenAI calls and approval rules;
- uploaded document storage;
- automated payment and planning reminders;
- recurring calendar sync and external hotel/PMS integration.

Their data boundaries and UI positions are now established, so they can be connected without redesigning the Functions or Wedding workflows.
