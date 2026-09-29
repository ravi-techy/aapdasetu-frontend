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
    databaseSubdivisions = [],
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
    | Filter By District
    |--------------------------------------------------------------------------
    */

    const filteredData =
        filterFeaturesByDistrict(
            subdivisionData,
            selectedDistrict
        );


    /*
    |--------------------------------------------------------------------------
    | Feature
    |--------------------------------------------------------------------------
    */

    const onEachSubdivision = (
        feature,
        layer
    ) => {

        const properties =
            feature?.properties ||
            {};


        /*
         * ---------------------------------------------------------------
         * GEOJSON VALUES
         * ---------------------------------------------------------------
         */

        const subdivisionLgd =
            properties.subdivision_id ??
            properties.subdist_lgd ??
            properties.subdt_lgd ??
            properties.subdist_code;


        const subdivisionName =
            properties.subdivision_name ||
            properties.subdist_name ||
            properties.subdtname ||
            properties.name ||
            "Unknown Subdivision";


        const districtLgd =
            properties.dist_lgd;


        const districtName =
            properties.dtname ??
            properties.district ??
            selectedDistrict?.name ??
            "";


        /*
         * ---------------------------------------------------------------
         * FIND DATABASE SUBDIVISION
         * ---------------------------------------------------------------
         */

        const databaseSubdivision =
            databaseSubdivisions.find(
                (item) => {

                    /*
                     * Database district must match
                     * selected database district.
                     */

                    const sameDistrict =
                        Number(
                            item.district_id
                        ) ===
                        Number(
                            selectedDistrict?.id
                        );


                    /*
                     * Match subdivision name.
                     *
                     * This is currently the
                     * important bridge between
                     * GeoJSON and database.
                     */

                    const sameName =
                        String(
                            item.name || ""
                        )
                            .trim()
                            .toLowerCase() ===
                        String(
                            subdivisionName || ""
                        )
                            .trim()
                            .toLowerCase();


                    return (
                        sameDistrict &&
                        sameName
                    );

                }
            );


        /*
         * ---------------------------------------------------------------
         * Tooltip
         * ---------------------------------------------------------------
         */

        layer.bindTooltip(
            subdivisionName,
            {
                sticky: true,
                direction: "top",
            }
        );


        /*
         * ---------------------------------------------------------------
         * Hover
         * ---------------------------------------------------------------
         */

        attachHoverEvents(
            layer,
            MAP_STYLES.subdivision.normal,
            MAP_STYLES.subdivision.hover
        );


        /*
         * ---------------------------------------------------------------
         * Click
         * ---------------------------------------------------------------
         */

        layer.on(
            "click",
            (event) => {

                const {
                    lat,
                    lng,
                } = event.latlng;


                /*
                 * -------------------------------------------------------
                 * DATABASE RECORD REQUIRED
                 * -------------------------------------------------------
                 */

                if (
                    !databaseSubdivision
                ) {

                    console.warn(
                        "No database subdivision found:",
                        {
                            subdivisionLgd,
                            subdivisionName,
                            districtLgd,
                            districtName,
                        }
                    );


                    alert(
                        `Subdivision "${subdivisionName}" is not available in the database yet.`
                    );


                    return;

                }


                /*
                 * -------------------------------------------------------
                 * FINAL SUBDIVISION OBJECT
                 * -------------------------------------------------------
                 */

                const subdivision = {

                    /*
                     * DATABASE ID
                     */

                    id:
                        databaseSubdivision.id,


                    /*
                     * GEOJSON ID
                     */

                    subdivision_lgd:
                        subdivisionLgd,


                    /*
                     * DATABASE DISTRICT ID
                     */

                    districtId:
                        databaseSubdivision.district_id,


                    /*
                     * GEOJSON DISTRICT ID
                     */

                    districtLgd:
                        districtLgd,


                    /*
                     * DISTRICT NAME
                     */

                    districtName:
                        databaseSubdivision.district_name ||
                        districtName,


                    /*
                     * SUBDIVISION NAME
                     */

                    name:
                        databaseSubdivision.name ||
                        subdivisionName,


                    /*
                     * ADDRESS
                     */

                    address:
                        databaseSubdivision.address ||
                        "",


                    /*
                     * EXACT CLICK LOCATION
                     */

                    latitude:
                        lat,

                    longitude:
                        lng,


                    /*
                     * Original map data
                     */

                    properties,

                    feature,


                    /*
                     * Complete DB record
                     */

                    databaseSubdivision,

                };


                console.log(
                    "Selected subdivision:",
                    subdivision
                );


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
            getDistrictId(
                selectedDistrict
            )
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

            key={
                `subdivision-${selectedDistrict?.dist_lgd}`
            }

            data={
                filteredData
            }

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