import { useEffect } from "react";
import { useMap } from "react-leaflet";

import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";

export default function FloodRiskLayer() {
    const map = useMap();

    useEffect(() => {
        let rasterLayer = null;
        let cancelled = false;

        const loadFloodRisk = async () => {
            try {
                const response = await fetch(
                    "/geo/west-bengal/flood-risk.tif"
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to load flood-risk.tif: ${response.status}`
                    );
                }

                const arrayBuffer = await response.arrayBuffer();

                const georaster = await parseGeoraster(arrayBuffer);

                console.log("Flood risk GeoRaster:", georaster);

                if (cancelled) return;

                rasterLayer = new GeoRasterLayer({
                    georaster,

                    opacity: 0.65,

                    resolution: 64,
                });

                rasterLayer.addTo(map);

                console.log(
                    "Flood risk layer bounds:",
                    rasterLayer.getBounds()
                );
            } catch (error) {
                console.error("Failed to load flood risk TIFF:", error);
            }
        };

        loadFloodRisk();

        return () => {
            cancelled = true;

            if (rasterLayer) {
                map.removeLayer(rasterLayer);
            }
        };
    }, [map]);

    return null;
}