import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";

const districtColors = [
    "#fecaca",
    "#fed7aa",
    "#fef08a",
    "#d9f99d",
    "#bbf7d0",
    "#a7f3d0",
    "#99f6e4",
    "#bae6fd",
    "#bfdbfe",
    "#c7d2fe",
    "#ddd6fe",
    "#e9d5ff",
    "#f5d0fe",
    "#fbcfe8",
    "#fda4af",
    "#fdba74",
    "#fde68a",
    "#bef264",
    "#86efac",
    "#6ee7b7",
    "#67e8f9",
    "#93c5fd",
    "#a5b4fc",
];

const getDistrictColor = (districtId) => {
    const id = Number(districtId);

    if (Number.isNaN(id)) {
        return "#cbd5e1";
    }

    return districtColors[Math.abs(id) % districtColors.length];
};

export default function FloodHeatmapLayer() {
    const [geoData, setGeoData] = useState(null);

    useEffect(() => {
        const loadGeoJSON = async () => {
            try {
                const response = await fetch("/gis/flood-heatmap.geojson");

                if (!response.ok) {
                    throw new Error("Failed to load GeoJSON");
                }

                const data = await response.json();

                console.log("Flood GeoJSON:", data);
                console.log(
                    "First feature:",
                    data?.features?.[0]
                );

                setGeoData(data);
            } catch (error) {
                console.error("GeoJSON loading error:", error);
            }
        };

        loadGeoJSON();
    }, []);

    if (!geoData) {
        return null;
    }

    const getFeatureStyle = (feature) => {
        const properties = feature?.properties || {};

        const districtId = properties.dist_lgd;

        const color = getDistrictColor(districtId);

        return {
            color: "#475569",
            weight: 1,
            opacity: 0.9,

            // This only matters if the geometry is Polygon/MultiPolygon
            fillColor: color,
            fillOpacity: 0.35,
        };
    };

    const handleEachFeature = (feature, layer) => {
        const properties = feature?.properties || {};

        const districtName =
            properties.district_name ||
            properties.dtname ||
            "Unknown District";

        const districtId =
            properties.dist_lgd ||
            properties.dtcode11 ||
            "";

        // Tooltip
        layer.bindTooltip(
            `
        <div style="font-weight: 600;">
          ${districtName}
        </div>
      `,
            {
                sticky: true,
                direction: "top",
            }
        );

        layer.on({
            mouseover: (event) => {
                event.target.setStyle({
                    color: "#1e3a8a",
                    weight: 3,
                    opacity: 1,
                    fillOpacity: 0.55,
                });

                event.target.bringToFront();
            },

            mouseout: (event) => {
                event.target.setStyle(
                    getFeatureStyle(feature)
                );
            },
        });
    };

    return (
        <GeoJSON
            data={geoData}
            style={getFeatureStyle}
            onEachFeature={handleEachFeature}
        />
    );
}