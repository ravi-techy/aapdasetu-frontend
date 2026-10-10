import API_BASE_URL from "../config/Config";
 
const CONFIG_ENDPOINT = "/api/sentinel2/config.php";
const INUNDATION_ENDPOINT = "/api/sentinel2/inundation.php";
const SATELLITE_ENDPOINT = "/api/sentinel2/satellite.php";
 
function getAuthHeaders() {
  const storedToken =
    typeof localStorage === "undefined"
      ? ""
      : localStorage.getItem("token");
 
  const token =
    storedToken &&
    storedToken !== "null" &&
    storedToken !== "undefined"
      ? storedToken.trim()
      : "";
 
  return token ? { Authorization: `Bearer ${token}` } : {};
}
 
async function getErrorMessage(response) {
  if (response.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:expired"));
  }
 
  const responseText = await response.text();
 
  try {
    const body = JSON.parse(responseText);
 
    if (typeof body?.message === "string" && body.message.trim()) {
      return body.message;
    }
  } catch {
    // The server may return a plain-text or HTML error.
  }
 
  return (
    responseText.trim().slice(0, 300) ||
    `Server error (${response.status}).`
  );
}
 
export async function getSentinel2Config({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${CONFIG_ENDPOINT}`, {
    headers: getAuthHeaders(),
    signal,
  });
 
  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
 
  let result;
 
  try {
    result = await response.json();
  } catch {
    throw new Error("The Sentinel-2 configuration response was not valid JSON.");
  }
 
  const config = result?.data;
 
  if (
    !Number.isFinite(config?.maxCloudCover) ||
    config.maxCloudCover < 0 ||
    config.maxCloudCover > 100 ||
    !Number.isFinite(config?.mndwiThreshold) ||
    config.mndwiThreshold < -1 ||
    config.mndwiThreshold > 1
  ) {
    throw new Error("The Sentinel-2 configuration response is incomplete or invalid.");
  }
 
  return config;
}
 
async function requestSentinel2Image(
  endpoint,
  { date, bounds, width, height },
  { signal } = {}
) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      date,
      bbox: {
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth(),
      },
      width,
      height,
    }),
    signal,
  });
 
  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
 
  if (
    !response.headers
      .get("Content-Type")
      ?.toLowerCase()
      .includes("image/png")
  ) {
    throw new Error("The Sentinel-2 service did not return a PNG image.");
  }
 
  return response.blob();
}
 
export async function getSentinel2SatelliteImage(
  params,
  options = {}
) {
  return requestSentinel2Image(
    SATELLITE_ENDPOINT,
    params,
    options
  );
}
 
export async function getSentinel2InundationImage(
  params,
  options = {}
) {
  return requestSentinel2Image(
    INUNDATION_ENDPOINT,
    params,
    options
  );
}