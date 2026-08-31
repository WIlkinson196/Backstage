# Backstage Enquiries — migration notes from the existing CRM

The old CRM was used as a product/reference source, not copied into the new codebase.

Useful workflows preserved and improved:

- New enquiry
- Initial call
- Call connected
- Call no answer / voicemail
- Email sent
- Viewing booked
- Viewing completed
- Proposal / quote sent
- Provisional booking
- Confirmed booking
- Lost enquiry
- Follow up later
- Custom next follow-up date
- Lead source
- Priority / hot opportunity
- Owner / assigned staff
- Lost reason and notes
- Proposal generation state
- Pipeline health
- Revenue at risk
- Future action requirement
- Opportunity qualification concepts
- Guided next move / recommended action

Backstage improvements:

- A single premium enquiry workspace instead of fragmented modal-heavy screens
- AI qualification and next-best-action built into the record
- Activity timeline as a first-class entity
- Dedicated viewings and proposals tables
- Buying signals and pipeline health prepared in the schema
- No reliance on hard-coded status UI
- Feature code lives under `/features/enquiries`
- Database changes are isolated in migration `007_sales_intelligence.sql`
