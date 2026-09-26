import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";

import { MAP_STYLES } from "../../constants/mapStyles";


function BlocksLayer({
	selectedDistrict,
	selectedSubdivision,
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
	|
	| District → Subdivision → Block
	|
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
							 * District matching
							 */

							const districtMatches =
								Number(
									properties.dist_lgd
								) ===
								Number(
									selectedDistrict.dist_lgd ??
									selectedDistrict.id
								);


							/*
							 * Subdivision matching
							 *
							 * Your blocks GeoJSON contains:
							 *
							 * subdivision_id
							 * subdivision_name
							 */

							const subdivisionMatches =
								String(
									properties.subdivision_id ??
									""
								) ===
								String(
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
	| Events
	|--------------------------------------------------------------------------
	*/

	const onEachBlock = (
		feature,
		layer
	) => {

		const properties =
			feature?.properties || {};


		/*
		|--------------------------------------------------------------------------
		| Block
		|--------------------------------------------------------------------------
		*/

		const blockName =
			properties.block_name ||
			"Unknown Block";


		const blockId =
			properties.block_lgd;


		/*
		|--------------------------------------------------------------------------
		| District
		|--------------------------------------------------------------------------
		*/

		const districtId =
			properties.dist_lgd;


		const districtName =
			properties.district ||
			properties.dtname ||
			selectedDistrict?.name ||
			"";


		/*
		|--------------------------------------------------------------------------
		| Subdivision
		|--------------------------------------------------------------------------
		*/

		const subdivisionId =
			properties.subdivision_id;


		const subdivisionName =
			properties.subdivision_name ||
			selectedSubdivision?.name ||
			"";


		/*
		|--------------------------------------------------------------------------
		| Tooltip
		|--------------------------------------------------------------------------
		*/

		layer.bindTooltip(
			blockName,
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
			|--------------------------------------------------------------------------
			| Block Click
			|--------------------------------------------------------------------------
			|
			| IMPORTANT:
			| event.latlng = exact point where
			| the user clicked the block.
			|
			*/

			click: (event) => {

				const {
					lat,
					lng,
				} = event.latlng;


				const block = {

					id:
						blockId,

					name:
						blockName,

					districtId:
						districtId,

					districtName:
						districtName,

					subdivisionId:
						subdivisionId,

					subdivisionName:
						subdivisionName,


					/*
					 * EXACT mouse click position
					 */

					latitude:
						lat,

					longitude:
						lng,


					properties,

					feature,

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
	| District Required
	|--------------------------------------------------------------------------
	*/

	if (!selectedDistrict) {
		return null;
	}


	/*
	|--------------------------------------------------------------------------
	| Subdivision Required
	|--------------------------------------------------------------------------
	*/

	if (!selectedSubdivision) {
		return null;
	}


	/*
	|--------------------------------------------------------------------------
	| Loading
	|--------------------------------------------------------------------------
	*/

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
				`blocks-${selectedDistrict.id
				}-${selectedSubdivision.id
				}`
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