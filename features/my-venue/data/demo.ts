import type { VenuePolicy, VenueProduct, VenueProfileForm, VenueSpace } from "../types/config";

export const demoVenueProfile: VenueProfileForm = {
  name: "The Granary",
  tradingName: "The Granary at Windmill Farm",
  description: "A flexible wedding, conference and private events venue.",
  phone: "01522 000000",
  email: "events@example.com",
  website: "https://example.com",
  logoUrl: "",
  heroImageUrl: ""
};

export const demoSpaces: VenueSpace[] = [
  {
    id: "space-granary",
    name: "The Granary",
    description: "Main event space for weddings, conferences and private functions.",
    capacitySeated: 160,
    capacityStanding: 200,
    isActive: true
  },
  {
    id: "space-garden",
    name: "Event Garden",
    description: "Outdoor event space and wedding photo area.",
    capacitySeated: 80,
    capacityStanding: 120,
    isActive: true
  }
];

export const demoProducts: VenueProduct[] = [
  { id: "wed-evergreen", category: "wedding", name: "Evergreen", description: "Entry all-day wedding package.", basePrice: 1995, priceType: "fixed", isActive: true },
  { id: "wed-blossom", category: "wedding", name: "Blossom", description: "Enhanced wedding package.", basePrice: 3999, priceType: "fixed", isActive: true },
  { id: "wed-willow", category: "wedding", name: "Willow", description: "Premium wedding package.", basePrice: 4495.95, priceType: "fixed", isActive: true },
  { id: "meet-day", category: "meeting", name: "Delegate Day Package", description: "Meeting room, refreshments and catering.", basePrice: 25, priceType: "per_person", isActive: true },
  { id: "private-room", category: "private_event", name: "Private Event Room Hire", description: "Evening private event hire.", basePrice: 300, priceType: "fixed", isActive: true },
  { id: "food-buffet", category: "food", name: "Finger Buffet", description: "Cold finger buffet.", basePrice: 14, priceType: "per_person", isActive: true },
  { id: "food-hog", category: "food", name: "Hog Roast", description: "Evening hog roast.", basePrice: 16, priceType: "per_person", isActive: true },
  { id: "extra-dj", category: "extra", name: "DJ", description: "Resident entertainment package.", basePrice: 400, priceType: "fixed", isActive: true },
  { id: "extra-love", category: "extra", name: "LOVE Letters", description: "Illuminated LOVE letters.", basePrice: 180, priceType: "fixed", isActive: true }
];

export const demoPolicies: VenuePolicy[] = [
  { id: "pol-deposit", policyKey: "booking_deposit", title: "Booking Deposit", content: "A deposit is required to secure the booking." },
  { id: "pol-provisional", policyKey: "provisional_hold", title: "Provisional Hold", content: "Provisional bookings can be held for a limited period." },
  { id: "pol-final", policyKey: "final_details", title: "Final Details", content: "Final planning information must be supplied ahead of the event." }
];
