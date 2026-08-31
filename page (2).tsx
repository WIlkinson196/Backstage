import { getPortalMessages } from "@/features/portal/services/repository";
import { PortalMessages } from "@/features/portal/components/portal-messages";
export default async function Page(){const messages=await getPortalMessages();return <div className="px-5 py-10 pb-24"><PortalMessages messages={messages}/></div>}
