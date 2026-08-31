import { demoPolicies, demoProducts, demoSpaces, demoVenueProfile } from "../data/demo";
import type { VenuePolicy, VenueProduct, VenueProfileForm, VenueSpace } from "../types/config";
import {
  getSupabaseVenuePolicies,
  getSupabaseVenueProducts,
  getSupabaseVenueProfile,
  getSupabaseVenueSpaces
} from "./supabase-repository";

/**
 * Read repository.
 *
 * If Supabase environment variables are present and the schema is accessible,
 * Backstage reads from the fresh project. Otherwise it safely falls back to demo data.
 *
 * Public writes are deliberately NOT enabled while there is no authentication.
 */
export async function getVenueProfile(): Promise<VenueProfileForm> {
  return (await getSupabaseVenueProfile()) ?? demoVenueProfile;
}
export async function getVenueSpaces(): Promise<VenueSpace[]> {
  return (await getSupabaseVenueSpaces()) ?? demoSpaces;
}
export async function getVenueProducts(): Promise<VenueProduct[]> {
  return (await getSupabaseVenueProducts()) ?? demoProducts;
}
export async function getVenuePolicies(): Promise<VenuePolicy[]> {
  return (await getSupabaseVenuePolicies()) ?? demoPolicies;
}
