import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { getSentinel2SatelliteImage } from "../../services/sentinel2Service";
import { WEST_BENGAL_BOUNDS } from "../../constants/mapBounds";
 
const SATELLITE_IMAGE_SIZE = { width: 1600, height: 2200 };
 
export default function Sentinel2SatelliteLayer({
  date,
  opacity = 100,
  selectedDistrict,
  onStatus,
}) {
  const map = useMap();
 
  const overlayRef = useRef(null);
  const imageUrlRef = useRef("");
  const requestRef = useRef(null);
  const opacityRef = useRef(opacity);
  const statusCallbackRef = useRef(onStatus);
 
  useEffect(() => {
    statusCallbackRef.current = onStatus;
  }, [onStatus]);
 
  useEffect(() => {
    opacityRef.current = opacity;
    overlayRef.current?.setOpacity(opacity / 100);
  }, [opacity]);
 
  useEffect(() => {
    if (!date) {
      statusCallbackRef.current?.({
        loading: false,
        error: "Please select a Sentinel-2 date.",
        config: null,
      });
      return undefined;
    }
 
    let disposed = false;
 
    const removeOverlay = () => {
      overlayRef.current?.remove();
      overlayRef.current = null;
 
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
        imageUrlRef.current = "";
      }
    };
 
    const updateLayer = async () => {
      requestRef.current?.abort();
 
      const controller = new AbortController();
      requestRef.current = controller;
 
      removeOverlay();
 
      statusCallbackRef.current?.({
        loading: true,
        error: "",
        config: null,
      });
 
      try {
        const districtBounds = selectedDistrict?.bounds;
        const bounds = districtBounds
          ? L.latLngBounds(
            [districtBounds.south, districtBounds.west],
            [districtBounds.north, districtBounds.east]
          )
          : L.latLngBounds(WEST_BENGAL_BOUNDS);
 
        if (districtBounds) {
          map.fitBounds(bounds, { padding: [20, 20] });
        }
 
        const image = await getSentinel2SatelliteImage(
          { date, bounds, ...SATELLITE_IMAGE_SIZE },
          { signal: controller.signal }
        );
 
        if (controller.signal.aborted || disposed) return;
 
        const imageUrl = URL.createObjectURL(image);
        const paneName = "sentinel2SatellitePane";
        const pane = map.getPane(paneName) || map.createPane(paneName);
 
        // Above the base map, below most markers and labels.
        pane.style.zIndex = "300";
        pane.style.pointerEvents = "none";
 
        const overlay = L.imageOverlay(imageUrl, bounds, {
          opacity: opacityRef.current / 100,
          interactive: false,
          pane: paneName,
        });
 
        overlay.addTo(map);
 
        overlayRef.current = overlay;
        imageUrlRef.current = imageUrl;
 
        statusCallbackRef.current?.({
          loading: false,
          error: "",
          config: null,
        });
      } catch (loadError) {
        if (loadError.name === "AbortError") return;
 
        console.error("Sentinel-2 satellite imagery error:", loadError);
 
        if (!controller.signal.aborted && !disposed) {
          statusCallbackRef.current?.({
            loading: false,
            error: loadError.message || "Unable to load satellite imagery.",
            config: null,
          });
        }
      }
    };
 
    updateLayer();
 
    return () => {
      disposed = true;
      requestRef.current?.abort();
      removeOverlay();
    };
  }, [date, map, selectedDistrict?.dist_lgd, selectedDistrict?.bounds]);
 
  return null;
}