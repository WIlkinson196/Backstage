import { getWeddingFloorPlanZones, getWeddingTables } from "@/features/weddings/services/guest-repository";
import { FloorPlanCanvas } from "@/features/weddings/components/floor-plan-canvas";

export default async function FloorPlanPage({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const [tables, zones] = await Promise.all([getWeddingTables(id), getWeddingFloorPlanZones(id)]);
  return <div className="space-y-4"><div className="text-[10px] font-bold uppercase tracking-[.12em] text-backstage-gold">Backstage v0.9.1 · Floor Plan Workspace</div><FloorPlanCanvas tables={tables} zones={zones}/></div>;
}
