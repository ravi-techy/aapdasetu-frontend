import React, { useState } from "react";
import {
	MapContainer,
	Marker,
	Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import DistrictLayer from "../../components/map/DistrictLayer";
import BlocksLayer from "../../components/map/BlocksLayer";
import { WEST_BENGAL_BOUNDS } from "../../constants/mapBounds";
import SubdivisionLayer from "../../components/map/SubDivisionLayer";

function BlocksLocation() {
	const [form, setForm] = useState({
		district_id: "",
		district: "",
		subdivision_id: "",
		subdivision: "",
		name: "",
		address: "",
		latitude: "",
		longitude: "",
	});

	const [position, setPosition] = useState(null);
	const [selectedDistrict, setSelectedDistrict] =
		useState(null);
	const [selectedSubdivision, setSelectedSubdivision] =
		useState(null);

	const handleChange = (event) => {
		const { name, value } = event.target;

		setForm((previous) => ({
			...previous,
			[name]: value,
		}));
	};

	/**
	 * -------------------------------------------------------
	 * District Selection
	 * -------------------------------------------------------
	 */
	const handleDistrictSelect = (district) => {
		console.log(
			"Selected district:",
			district
		);

		setSelectedDistrict(district);

		/*
		* District changed, so previous
		* subdivision and block selection
		* must be cleared.
		*/
		setSelectedSubdivision(null);

		// Remove previous marker
		setPosition(null);

		// Reset block-related fields
		setForm((previous) => ({
			...previous,

			district_id:
				district.id,

			district:
				district.name || "",

			subdivision_id:
				"",

			subdivision:
				"",

			name:
				"",

			latitude:
				"",

			longitude:
				"",
		}));
	};

	/**
	 * -------------------------------------------------------
	 * Subdivision Selection
	 * -------------------------------------------------------
	 */
	const handleSubdivisionSelect = (
		subdivision
	) => {

		console.log(
			"Selected subdivision:",
			subdivision
		);


		setSelectedSubdivision(
			subdivision
		);


		/*
		 * Clear previously selected block
		 */

		setPosition(null);


		/*
		 * Update form
		 */

		setForm((previous) => ({

			...previous,

			district_id:
				selectedDistrict?.id ||
				subdivision.districtId ||
				"",

			district:
				selectedDistrict?.name ||
				subdivision.districtName ||
				"",

			subdivision_id:
				subdivision.id ||
				"",

			subdivision:
				subdivision.name ||
				"",

			name:
				"",

			latitude:
				"",

			longitude:
				"",

		}));

	};


	/**
	 * -------------------------------------------------------
	 * Block Selection
	 * -------------------------------------------------------
	 */
	const handleBlockSelect = (block) => {

		console.log(
			"Selected block:",
			block
		);


		setForm((previous) => ({

			...previous,

			district_id:
				block.districtId ||
				selectedDistrict?.id ||
				"",

			district:
				block.districtName ||
				selectedDistrict?.name ||
				"",

			subdivision_id:
				block.subdivisionId ||
				selectedSubdivision?.id ||
				"",

			subdivision:
				block.subdivisionName ||
				selectedSubdivision?.name ||
				"",

			name:
				block.name ||
				"",

			latitude:
				block.latitude != null
					? block.latitude.toFixed(6)
					: "",

			longitude:
				block.longitude != null
					? block.longitude.toFixed(6)
					: "",

		}));


		/*
		 * Marker at exact mouse-click position
		 */

		setPosition({

			lat:
				block.latitude,

			lng:
				block.longitude,

		});

	};

	/**
	 * -------------------------------------------------------
	 * Form Submit
	 * -------------------------------------------------------
	 */
	const handleSubmit = (event) => {
		event.preventDefault();

		console.log(
			"Block data:",
			form
		);
	};

	return (
		<div className="relative min-h-screen w-full bg-gray-50 p-6">

			{/* Header */}
			<div className="relative z-20 mb-6">
				<h1 className="text-2xl font-semibold text-gray-800">
					Block Location
				</h1>

				<p className="mt-1 text-sm text-gray-500">
					Add and manage block location information.
				</p>
			</div>

			{/* Main Layout */}
			<div className="relative z-0 grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">

				{/* =====================================================
            FORM
        ====================================================== */}
				<div className="relative z-0 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

					<h2 className="mb-6 text-lg font-semibold text-gray-800">
						Block Details
					</h2>

					<form
						onSubmit={handleSubmit}
						className="space-y-5"
					>

						{/* District */}
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700">
								District
							</label>

							<input
								type="text"
								name="district"
								value={form.district}
								onChange={handleChange}
								placeholder="Select district from map"
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							/>
						</div>

						{/* Subdivision */}
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700">
								Subdivision
							</label>

							<input
								type="text"
								name="subdivision"
								value={form.subdivision}
								readOnly
								placeholder="Select subdivision from map"
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							/>

						</div>

						{/* Block Name */}
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700">
								Block Name
							</label>

							<input
								type="text"
								name="name"
								value={form.name}
								onChange={handleChange}
								placeholder="Block name"
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							/>
						</div>

						{/* Address */}
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700">
								Address
							</label>

							<textarea
								name="address"
								value={form.address}
								onChange={handleChange}
								rows={3}
								placeholder="Block address"
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							/>
						</div>

						{/* Latitude */}
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700">
								Latitude
							</label>

							<input
								type="number"
								step="any"
								name="latitude"
								value={form.latitude}
								onChange={handleChange}
								placeholder="Latitude"
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							/>
						</div>

						{/* Longitude */}
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700">
								Longitude
							</label>

							<input
								type="number"
								step="any"
								name="longitude"
								value={form.longitude}
								onChange={handleChange}
								placeholder="Longitude"
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							/>
						</div>

						{/* Submit */}
						<button
							type="submit"
							className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
						>
							Save Block
						</button>

					</form>
				</div>

				{/* =====================================================
            MAP
        ====================================================== */}
				<div className="relative z-0 isolate overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

					{/* Map Header */}
					<div className="relative z-20 border-b border-gray-200 px-5 py-4">

						<h2 className="text-lg font-semibold text-gray-800">
							Block Map
						</h2>

						<p className="mt-1 text-sm text-gray-500">
							Select a district first, then hover over a
							block and click to select it.
						</p>

					</div>

					{/* Map */}
					<div className="relative z-0 h-[600px] w-full">

						<MapContainer
							center={[22.5726, 88.3639]}
							zoom={7}
							minZoom={6.5}
							maxZoom={12}
							maxBounds={WEST_BENGAL_BOUNDS}
							maxBoundsViscosity={1.0}
							scrollWheelZoom={true}
							className="h-full w-full"
						>

							{/* =================================================
        LEVEL 1 — DISTRICT
    ================================================== */}

							<DistrictLayer
								selectedDistrict={
									selectedDistrict
								}
								onDistrictSelect={
									handleDistrictSelect
								}
							/>


							{/* =================================================
        LEVEL 2 — SUBDIVISION
    ================================================== */}

							{selectedDistrict && (

								<SubdivisionLayer
									selectedDistrict={
										selectedDistrict
									}
									onSubdivisionSelect={
										handleSubdivisionSelect
									}
								/>

							)}


							{/* =================================================
        LEVEL 3 — BLOCK
    ================================================== */}

							{selectedDistrict &&
								selectedSubdivision && (

									<BlocksLayer
										selectedDistrict={
											selectedDistrict
										}

										selectedSubdivision={
											selectedSubdivision
										}

										onBlockSelect={
											handleBlockSelect
										}
									/>

								)}


							{/* =================================================
        SELECTED BLOCK MARKER
    ================================================== */}

							{position && (

								<Marker
									position={[
										position.lat,
										position.lng,
									]}
								>

									<Popup>

										<div className="text-sm">

											<p className="font-semibold">
												{form.name}
											</p>

											<p>
												District:{" "}
												{form.district}
											</p>

											<p>
												Subdivision:{" "}
												{form.subdivision}
											</p>

											<p>
												Latitude:{" "}
												{position.lat.toFixed(6)}
											</p>

											<p>
												Longitude:{" "}
												{position.lng.toFixed(6)}
											</p>

										</div>

									</Popup>

								</Marker>

							)}

						</MapContainer>

					</div>

					{/* =====================================================
              COORDINATES
          ====================================================== */}
					<div className="grid grid-cols-2 border-t border-gray-200">

						<div className="px-5 py-4">

							<p className="text-xs text-gray-500">
								Latitude
							</p>

							<p className="mt-1 text-sm font-medium text-gray-800">
								{form.latitude || "--"}
							</p>

						</div>

						<div className="border-l border-gray-200 px-5 py-4">

							<p className="text-xs text-gray-500">
								Longitude
							</p>

							<p className="mt-1 text-sm font-medium text-gray-800">
								{form.longitude || "--"}
							</p>

						</div>

					</div>

				</div>
			</div>
		</div>
	);
}

export default BlocksLocation;