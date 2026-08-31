# VenueOS UI migration — current Windmill Farm CRM

This build deliberately keeps the existing CRM JavaScript, Supabase configuration, tables and operational workflows intact.

## What changed

- Premium VenueOS login screen
- VenueOS / The Granary app branding
- Dark navy sidebar + champagne/gold accent system
- Warm ivory application canvas
- Premium header/search treatment
- Restyled cards, tables, inputs, badges, buttons and modals
- VenueOS styling applied to existing Enquiries, Weddings, Functions, Operations, Sales OS, Hotel, Reports, Settings and other existing screens as they render
- VenueOS Intelligence visual naming in the shell (existing Windmill Intelligence JavaScript remains unchanged underneath)

## What did NOT change

- Existing Supabase credentials/config
- Authentication functions
- Database queries
- Existing wedding logic
- Existing enquiry logic
- Existing functions/operations logic
- Existing document generation logic
- Existing routing/navigation functions

The intention is to use the proven current CRM as the functional product and replace its visual layer first.

## Main new file

`venueos-theme.css`

It loads after the existing stylesheets and acts as the final visual override layer. This means the old screens continue to render from the existing JavaScript, but inherit the new VenueOS visual system.

## Deployment

Replace the current website files with this folder contents, preserving the folder structure. The current `js/config.js` is included exactly as it existed in the supplied ZIP, so review it before publishing to a public GitHub repository if it contains any credentials that should not be public.
