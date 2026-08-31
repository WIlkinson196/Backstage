import { portalDocuments, portalMessages, portalPayments, portalTasks, portalWedding } from "../data/demo";

export async function getPortalWedding() { return portalWedding; }
export async function getPortalTasks() { return portalTasks; }
export async function getPortalDocuments() { return portalDocuments; }
export async function getPortalPayments() { return portalPayments; }
export async function getPortalMessages() { return portalMessages; }
