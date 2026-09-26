import { GeoJSON } from "react-leaflet";

import {
    filterFeaturesByDistrict,
    getDistrictId,
} from "../../utils/map";

import useGeoJSONData from "../../hooks/useGEOJsonData";
import { attachHoverEvents } from "../../utils/leaflet";
import { MAP_STYLES } from "../../constants/mapStyles";


function SubdivisionLayer({
    selectedDistrict,
    onSubdivisionSelect,
}) {

    const {
        data: subdivisionData,
        loading,
        error,
    } = useGeoJSONData(
        "/gis/subdivisions.geojson",
        "Subdivision"
    );


    /*
    |--------------------------------------------------------------------------
    | Filter subdivisions by selected district
    |--------------------------------------------------------------------------
    */

    const filteredData =
        filterFeaturesByDistrict(
            subdivisionData,
            selectedDistrict
        );


    /*
    |--------------------------------------------------------------------------
    | Feature Events
    |--------------------------------------------------------------------------
    */

    const onEachSubdivision = (
        feature,
        layer
    ) => {

        const properties =
            feature?.properties || {};


        /*
        |--------------------------------------------------------------------------
        | Subdivision Name
        |--------------------------------------------------------------------------
        */

        const subdivisionName =
            properties.subdivision_name ||
            properties.subdist_name ||
            properties.subdtname ||
            properties.name ||
            "Unknown Subdivision";


        /*
        |--------------------------------------------------------------------------
        | Subdivision ID
        |--------------------------------------------------------------------------
        */

        const subdivisionId =
            properties.subdivision_id ??
            properties.subdist_lgd ??
            properties.subdt_lgd ??
            properties.subdist_code;


        /*
        |--------------------------------------------------------------------------
        | District ID
        |--------------------------------------------------------------------------
        */

        const districtId =
            properties.dist_lgd;


        /*
        |--------------------------------------------------------------------------
        | Tooltip
        |--------------------------------------------------------------------------
        */

        layer.bindTooltip(
            subdivisionName,
            {
                sticky: true,
                direction: "top",
            }
        );


        /*
        |--------------------------------------------------------------------------
        | Hover
        |--------------------------------------------------------------------------
        */

        attachHoverEvents(
            layer,
            MAP_STYLES.subdivision.normal,
            MAP_STYLES.subdivision.hover
        );


        /*
        |--------------------------------------------------------------------------
        | Click
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        | Use event.latlng instead of polygon center.
        |
        */

        layer.on(
            "click",
            (event) => {

                const {
                    lat,
                    lng,
                } = event.latlng;


                const subdivision = {

                    id: subdivisionId,

                    name: subdivisionName,

                    districtId,

                    districtName:
                        properties.dtname ||
                        properties.district ||
                        selectedDistrict?.name ||
                        "",

                    /*
                     * Exact mouse click position
                     */
                    latitude: lat,

                    longitude: lng,

                    properties,

                    feature,
                };


                console.log(
                    "Selected subdivision:",
                    subdivision
                );


                /*
                 * Send selected subdivision
                 * to parent component
                 */

                onSubdivisionSelect?.(
                    subdivision
                );

            }
        );

    };


    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    if (error) {

        return (

            <div className="absolute left-4 top-4 z-[1000] rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700 shadow">

                {error}

            </div>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (
        loading ||
        !filteredData
    ) {

        return null;

    }


    /*
    |--------------------------------------------------------------------------
    | No Data
    |--------------------------------------------------------------------------
    */

    if (
        filteredData.features.length === 0
    ) {

        console.warn(
            "No subdivisions found for district:",
            getDistrictId(selectedDistrict)
        );

        return null;

    }


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (

        <GeoJSON
            key={`subdivision-${getDistrictId(
                selectedDistrict
            )}`}
            data={filteredData}
            style={
                MAP_STYLES.subdivision.normal
            }
            onEachFeature={
                onEachSubdivision
            }
        />

    );

}


export default SubdivisionLayer;