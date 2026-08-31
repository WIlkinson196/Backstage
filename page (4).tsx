import { getPortalPayments } from "@/features/portal/services/repository";
import { PortalPayments } from "@/features/portal/components/portal-payments";
export default async function Page(){const payments=await getPortalPayments();return <div className="mx-auto max-w-[1280px] px-5 py-10 pb-24"><div className="mb-7"><div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#A37E4B]">Your wedding</div><h1 className="mt-2 font-serif text-4xl">Payments</h1></div><PortalPayments payments={payments}/></div>}
