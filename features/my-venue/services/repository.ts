import {
  demoPolicies,
  demoProducts,
  demoSpaces,
  demoVenueProfile
} from "../data/demo";
import type {
  VenuePolicy,
  VenueProduct,
  VenueProfileForm,
  VenueSpace
} from "../types/config";

/**
 * v0.2 repository boundary.
 *
 * The UI talks to this layer instead of talking to Supabase directly.
 * That means we can switch between demo data and a real Supabase project
 * without rewriting page components.
 */

export async function getVenueProfile(): Promise<VenueProfileForm> {
  return demoVenueProfile;
}

export async function getVenueSpaces(): Promise<VenueSpace[]> {
  return demoSpaces;
}

export async function getVenueProducts(): Promise<VenueProduct[]> {
  return demoProducts;
}

export async function getVenuePolicies(): Promise<VenuePolicy[]> {
  return demoPolicies;
}
