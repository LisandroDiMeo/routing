import MapLibreGL from "@maplibre/maplibre-react-native";
import type { Coordinate } from "@/types";

const ROUTE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

interface RoutePolylineProps {
  coordinates: Coordinate[];
  index: number;
  isSelected: boolean;
}

export function RoutePolyline({
  coordinates,
  index,
  isSelected,
}: RoutePolylineProps) {
  const color = ROUTE_COLORS[index % ROUTE_COLORS.length];
  const sourceId = `route-source-${index}`;
  const layerId = `route-layer-${index}`;

  const geoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: coordinates.map((c) => [c.longitude, c.latitude]),
    },
  };

  const style: Record<string, unknown> = {
    lineColor: color,
    lineWidth: isSelected ? 5 : 3,
    lineOpacity: isSelected ? 1 : 0.5,
    lineCap: "round",
    lineJoin: "round",
  };

  if (!isSelected) {
    style.lineDasharray = [2, 2];
  }

  return (
    <MapLibreGL.ShapeSource id={sourceId} shape={geoJSON}>
      <MapLibreGL.LineLayer id={layerId} style={style} />
    </MapLibreGL.ShapeSource>
  );
}
