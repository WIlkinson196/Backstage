import type { VenuePolicy, VenueProduct, VenueProfileForm, VenueSpace } from "../types/config";

const DEMO_VENUE_ID = "22222222-2222-2222-2222-222222222222";

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

async function rest<T>(path: string): Promise<T | null> {
  const c = config();
  if (!c) return null;
  const res = await fetch(`${c.url}/rest/v1/${path}`, {
    headers: {
      apikey: c.key,
      Authorization: `Bearer ${c.key}`
    },
    next: { revalidate: 30 }
  });
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

export async function getSupabaseVenueProfile(): Promise<VenueProfileForm | null> {
  const rows = await rest<any[]>(`venues?id=eq.${DEMO_VENUE_ID}&select=*`);
  const row = rows?.[0];
  if (!row) return null;
  return {
    name: row.name ?? "",
    tradingName: row.trading_name ?? "",
    description: row.description ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    website: row.website ?? "",
    logoUrl: row.logo_url ?? "",
    heroImageUrl: row.hero_image_url ?? ""
  };
}

export async function getSupabaseVenueSpaces(): Promise<VenueSpace[] | null> {
  const rows = await rest<any[]>(`venue_spaces?venue_id=eq.${DEMO_VENUE_ID}&select=*&order=name`);
  if (!rows) return null;
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    capacitySeated: row.capacity_seated,
    capacityStanding: row.capacity_standing,
    isActive: row.is_active
  }));
}

export async function getSupabaseVenueProducts(): Promise<VenueProduct[] | null> {
  const rows = await rest<any[]>(`venue_products?venue_id=eq.${DEMO_VENUE_ID}&select=*&order=name`);
  if (!rows) return null;
  return rows.map(row => ({
    id: row.id,
    category: row.category,
    name: row.name,
    description: row.description ?? "",
    basePrice: row.base_price === null ? null : Number(row.base_price),
    priceType: row.price_type,
    isActive: row.is_active,
    metadata: row.metadata ?? {}
  }));
}

export async function getSupabaseVenuePolicies(): Promise<VenuePolicy[] | null> {
  const rows = await rest<any[]>(`venue_policies?venue_id=eq.${DEMO_VENUE_ID}&select=*&order=title`);
  if (!rows) return null;
  return rows.map(row => ({
    id: row.id,
    policyKey: row.policy_key,
    title: row.title,
    content: row.content ?? "",
    metadata: row.metadata ?? {}
  }));
}
