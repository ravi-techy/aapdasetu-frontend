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
    databaseDistricts = [],
    databaseSubdivisions = [],
    onSubdivisionSelect,
    requireDatabaseDistrict = true,
    requireDatabaseSubdivision = false,
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
    | Filter By Selected District
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
         * FIND DATABASE DISTRICT AND SUBDIVISION
         * ---------------------------------------------------------------
         */
        const databaseDistrict = databaseDistricts.find(
            (district) =>
                Number(district.id) ===
                Number(selectedDistrict?.id)
        );

        const databaseSubdivision =
            databaseSubdivisions.find(
                (item) => {

                    /*
                     * Database district must match
                     * selected DATABASE district.
                     */

                    const sameDistrict =
                        Number(
                            item.district_id
                        ) ===
                        Number(
                            selectedDistrict?.id
                        );


                    /*
                     * Match by name.
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

        layer.on("click", (event) => {
            const { lat, lng } = event.latlng;

            /*
             * -------------------------------------------------
             * 1. Parent district must exist in database
             * -------------------------------------------------
             */
            if (
                requireDatabaseDistrict &&
                !databaseDistrict
            ) {
                alert(
                    `District "${districtName}" is not available in the database yet. Please create the district first.`
                );

                return;
            }

            /*
             * -------------------------------------------------
             * 2. Check whether subdivision already exists
             * -------------------------------------------------
             */
            if (
                requireDatabaseSubdivision &&
                !databaseSubdivision
            ) {
                alert(
                    `Subdivision "${subdivisionName}" is not available in the database yet.`
                );

                return;
            }

            /*
             * -------------------------------------------------
             * 3. Allow new subdivision if parent district exists
             * -------------------------------------------------
             */
            const subdivision = {
                // Existing DB subdivision ID
                // null for a new subdivision
                id:
                    databaseSubdivision?.id ??
                    null,

                // GeoJSON ID
                subdivision_lgd:
                    subdivisionLgd,

                // IMPORTANT:
                // This is the DATABASE district ID
                districtId:
                    databaseDistrict?.id ??
                    selectedDistrict?.id ??
                    null,

                // GeoJSON district ID
                districtLgd:
                    districtLgd,

                districtName:
                    databaseDistrict?.name ||
                    selectedDistrict?.name ||
                    districtName,

                name:
                    databaseSubdivision?.name ||
                    subdivisionName,

                address:
                    databaseSubdivision?.address ||
                    "",

                latitude: lat,
                longitude: lng,

                properties,
                feature,

                databaseSubdivision:
                    databaseSubdivision || null,
            };

            console.log(
                "Selected subdivision:",
                subdivision
            );

            onSubdivisionSelect?.(
                subdivision
            );
        });

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