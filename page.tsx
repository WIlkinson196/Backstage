import { getWeddingFloorPlanZones, getWeddingTables } from "@/features/weddings/services/guest-repository";
import { FloorPlanCanvas } from "@/features/weddings/components/floor-plan-canvas";

export default async function FloorPlanPage({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const [tables, zones] = await Promise.all([getWeddingTables(id), getWeddingFloorPlanZones(id)]);
  return <FloorPlanCanvas tables={tables} zones={zones}/>;
}
