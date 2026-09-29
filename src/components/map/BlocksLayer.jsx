import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";

import { MAP_STYLES } from "../../constants/mapStyles";


function BlocksLayer({
	selectedDistrict,
	selectedSubdivision,
	databaseBlocks = [],
	onBlockSelect,
}) {

	const [blockData, setBlockData] =
		useState(null);

	const [error, setError] =
		useState("");


	/*
	|--------------------------------------------------------------------------
	| Load Block GeoJSON
	|--------------------------------------------------------------------------
	*/

	useEffect(() => {

		fetch("/gis/blocks.geojson")

			.then((response) => {

				if (!response.ok) {

					throw new Error(
						`HTTP error: ${response.status}`
					);

				}

				return response.json();

			})

			.then((data) => {

				console.log(
					"Blocks GeoJSON:",
					data
				);


				if (
					!data ||
					!Array.isArray(
						data.features
					)
				) {

					throw new Error(
						"Invalid blocks GeoJSON format."
					);

				}


				setBlockData(data);

			})

			.catch((error) => {

				console.error(
					"Blocks GeoJSON error:",
					error
				);

				setError(
					"Unable to load block map data."
				);

			});

	}, []);


	/*
	|--------------------------------------------------------------------------
	| Filter Blocks
	|--------------------------------------------------------------------------
	*/

	const filteredBlockData =
		selectedDistrict &&
			selectedSubdivision &&
			blockData
			? {
				...blockData,

				features:
					blockData.features.filter(
						(feature) => {

							const properties =
								feature?.properties ||
								{};


							/*
							 * GeoJSON district ID
							 */

							const districtLgd =
								properties.dist_lgd;


							/*
							 * GeoJSON subdivision ID
							 */

							const subdivisionLgd =
								properties.subdivision_id;


							/*
							 * IMPORTANT:
							 *
							 * Map filtering uses
							 * GEOJSON IDs.
							 */

							const districtMatches =
								Number(
									districtLgd
								) ===
								Number(
									selectedDistrict.dist_lgd
								);


							const subdivisionMatches =
								String(
									subdivisionLgd ??
									""
								) ===
								String(
									selectedSubdivision.subdivision_lgd ??
									selectedSubdivision.id ??
									""
								);


							return (
								districtMatches &&
								subdivisionMatches
							);

						}
					),

			}
			: null;


	/*
	|--------------------------------------------------------------------------
	| Block Feature
	|--------------------------------------------------------------------------
	*/

	const onEachBlock = (
		feature,
		layer
	) => {

		const properties =
			feature?.properties ||
			{};


		/*
		 * ---------------------------------------------------------------
		 * GeoJSON values
		 * ---------------------------------------------------------------
		 */

		const blockLgd =
			properties.block_lgd;


		const districtLgd =
			properties.dist_lgd;


		const subdivisionLgd =
			properties.subdivision_id;


		const geoJsonBlockName =
			properties.block_name ||
			properties.block ||
			properties.name ||
			"Unknown Block";


		const geoJsonDistrictName =
			properties.district ||
			properties.dtname ||
			selectedDistrict?.name ||
			"";


		const geoJsonSubdivisionName =
			properties.subdivision_name ||
			selectedSubdivision?.name ||
			"";


		/*
		 * ---------------------------------------------------------------
		 * Find DATABASE block
		 * ---------------------------------------------------------------
		 *
		 * We first match using the currently
		 * selected DB district/subdivision and
		 * the block name.
		 */

		const databaseBlock =
			databaseBlocks.find(
				(item) => {

					const sameDistrict =
						Number(
							item.district_id
						) ===
						Number(
							selectedDistrict?.id
						);


					const sameSubdivision =
						Number(
							item.subdivision_id
						) ===
						Number(
							selectedSubdivision?.id
						);


					const sameName =
						String(
							item.name || ""
						)
							.trim()
							.toLowerCase() ===
						String(
							geoJsonBlockName || ""
						)
							.trim()
							.toLowerCase();


					return (
						sameDistrict &&
						sameSubdivision &&
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
			geoJsonBlockName,
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

		layer.on({

			mouseover: (event) => {

				event.target.setStyle(
					MAP_STYLES.block.hover
				);

				event.target.bringToFront();

			},


			mouseout: (event) => {

				event.target.setStyle(
					MAP_STYLES.block.normal
				);

			},


			/*
			 * -----------------------------------------------------------
			 * Click
			 * -----------------------------------------------------------
			 */

			click: (event) => {

				const {
					lat,
					lng,
				} = event.latlng;


				/*
				 * IMPORTANT:
				 *
				 * If no database block exists,
				 * do not treat the GeoJSON ID as
				 * a database ID.
				 */

				if (!databaseBlock) {

					console.warn(
						"No database block found for GeoJSON block:",
						{
							blockLgd,
							blockName:
								geoJsonBlockName,

							districtLgd,

							subdivisionLgd,
						}
					);


					alert(
						`Block "${geoJsonBlockName}" is not available in the database yet.`
					);


					return;

				}


				/*
				 * -------------------------------------------------------
				 * FINAL BLOCK OBJECT
				 * -------------------------------------------------------
				 *
				 * id              = DATABASE ID
				 * block_lgd       = GEOJSON ID
				 *
				 * districtId      = DATABASE ID
				 * districtLgd     = GEOJSON ID
				 *
				 * subdivisionId   = DATABASE ID
				 * subdivisionLgd  = GEOJSON ID
				 */

				const block = {

					/*
					 * DATABASE BLOCK ID
					 */

					id:
						databaseBlock.id,


					/*
					 * GEOJSON BLOCK ID
					 */

					block_lgd:
						blockLgd,


					/*
					 * DATABASE DISTRICT ID
					 */

					districtId:
						databaseBlock.district_id,


					/*
					 * GEOJSON DISTRICT ID
					 */

					districtLgd:
						districtLgd,


					/*
					 * DISTRICT NAME
					 */

					districtName:
						databaseBlock.district_name ||
						geoJsonDistrictName,


					/*
					 * DATABASE SUBDIVISION ID
					 */

					subdivisionId:
						databaseBlock.subdivision_id,


					/*
					 * GEOJSON SUBDIVISION ID
					 */

					subdivisionLgd:
						subdivisionLgd,


					/*
					 * SUBDIVISION NAME
					 */

					subdivisionName:
						databaseBlock.subdivision_name ||
						geoJsonSubdivisionName,


					/*
					 * BLOCK NAME
					 */

					name:
						databaseBlock.name ||
						geoJsonBlockName,


					/*
					 * ADDRESS FROM DATABASE
					 */

					address:
						databaseBlock.address ||
						"",


					/*
					 * EXACT MAP CLICK
					 */

					latitude:
						lat,


					longitude:
						lng,


					/*
					 * Original data
					 */

					properties,

					feature,

					/*
					 * Complete DB record
					 */

					databaseBlock,

				};


				console.log(
					"Selected block:",
					block
				);


				onBlockSelect?.(
					block
				);

			},

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
	| Selection Required
	|--------------------------------------------------------------------------
	*/

	if (!selectedDistrict) {
		return null;
	}


	if (!selectedSubdivision) {
		return null;
	}


	if (!blockData) {
		return null;
	}


	/*
	|--------------------------------------------------------------------------
	| No Blocks
	|--------------------------------------------------------------------------
	*/

	if (
		!filteredBlockData ||
		filteredBlockData.features.length === 0
	) {

		console.warn(
			"No blocks found for subdivision:",
			selectedSubdivision
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
				`blocks-${selectedDistrict.dist_lgd}-${selectedSubdivision.subdivision_lgd ?? selectedSubdivision.id}`
			}

			data={
				filteredBlockData
			}

			style={
				MAP_STYLES.block.normal
			}

			onEachFeature={
				onEachBlock
			}

		/>

	);

}


export default BlocksLayer;