import { demoActivities, demoEnquiries } from "../data/demo";
import type { EnquiryActivity, EnquiryRecord } from "../types/enquiry";

export async function getEnquiries(): Promise<EnquiryRecord[]> {
  return demoEnquiries;
}

export async function getEnquiry(id: string): Promise<EnquiryRecord | null> {
  return demoEnquiries.find((item) => item.id === id) ?? null;
}

export async function getEnquiryActivities(id: string): Promise<EnquiryActivity[]> {
  return demoActivities
    .filter((item) => item.enquiryId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
