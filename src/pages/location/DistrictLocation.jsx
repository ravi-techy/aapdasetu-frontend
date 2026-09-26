import React, { useEffect, useState } from "react";
import {
	MapContainer,
	// TileLayer,
	Marker,
	Popup,
	useMapEvents,
	GeoJSON
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import DistrictLayer from "../../components/map/DistrictLayer";
import { createDistrict, listDistricts } from "../../services";
import LocationMarker from "../../components/map/LocationMarker";
import { WEST_BENGAL_BOUNDS } from "../../constants/mapBounds";


/*
|--------------------------------------------------------------------------
| Map Location Marker
|--------------------------------------------------------------------------
*/

// function LocationMarker({ position, setPosition, selectedDistrict }) {
// 	useMapEvents({
// 		click(event) {
// 			const { lat, lng } = event.latlng;

// 			setPosition({
// 				lat,
// 				lng,
// 			});
// 		},
// 	});

// 	if (!position) {
// 		return null;
// 	}

// 	return (
// 		<Marker
// 			position={[
// 				position.lat,
// 				position.lng,
// 			]}
// 		>
// 			<Popup>
// 				<div className="text-sm">
// 					<p className="font-semibold">
// 						Selected Location
// 					</p>

// 					<p>
// 						Latitude: {position.lat.toFixed(6)}
// 					</p>

// 					<p>
// 						Longitude: {position.lng.toFixed(6)}
// 					</p>
// 				</div>
// 			</Popup>
// 		</Marker>
// 	);
// }


/*
|--------------------------------------------------------------------------
| District Location
|--------------------------------------------------------------------------
*/

function DistrictLocation() {
	const [form, setForm] = useState({
		name: "",
		address: "",
		latitude: "",
		longitude: "",
		storage_location: "",
	});

	const [position, setPosition] = useState(null);
	const [selectedDistrict, setSelectedDistrict] = useState(null);
	// const [districtData, setDistrictData] = useState(null);
	const [districts, setDistricts] = useState([]);
	const [loadingDistricts, setLoadingDistricts] = useState(false);
	const [districtError, setDistrictError] = useState("");

	// const WEST_BENGAL_BOUNDS = [
	// 	[21.45, 85.75], // South-West
	// 	[27.25, 89.90], // North-East
	// ];

	/*
	|--------------------------------------------------------------------------
	| Form Change
	|--------------------------------------------------------------------------
	*/

	const handleChange = (event) => {
		const { name, value } = event.target;

		setForm((previous) => ({
			...previous,
			[name]: value,
		}));

		/*
		 * If latitude or longitude is manually changed,
		 * update marker when both values are valid.
		 */

		if (
			name === "latitude" ||
			name === "longitude"
		) {
			const updatedForm = {
				...form,
				[name]: value,
			};

			const lat = parseFloat(
				updatedForm.latitude
			);

			const lng = parseFloat(
				updatedForm.longitude
			);

			if (
				!Number.isNaN(lat) &&
				!Number.isNaN(lng) &&
				lat >= -90 &&
				lat <= 90 &&
				lng >= -180 &&
				lng <= 180
			) {
				setPosition({
					lat,
					lng,
				});
			}
		}
	};


	/*
	|--------------------------------------------------------------------------
	| Map Click
	|--------------------------------------------------------------------------
	*/

	const handleMapPosition = (location) => {
		setPosition(location);

		setForm((previous) => ({
			...previous,
			latitude: location.lat.toFixed(6),
			longitude: location.lng.toFixed(6),
		}));
	};


	/*
	|--------------------------------------------------------------------------
	| Submit
	|--------------------------------------------------------------------------
	*/

	const handleSubmit = async (event) => {
		event.preventDefault();

		console.log(
			"District data:",
			form
		);

		try {
			console.log("District data:", form);

			const response = await createDistrict(form);

			console.log(
				"Create district response:",
				response
			);

			if (response?.success) {
				alert("District created successfully.");

				// Clear form if required
				setForm({
					name: "",
					address: "",
					latitude: "",
					longitude: "",
					storage_location: "",
				});

				setPosition(null);
				setSelectedDistrict(null);
				// Refresh table
				loadDistricts();
			} else {
				alert(
					response?.message ||
					"Failed to create district."
				);
			}

		} catch (error) {
			console.error(
				"Create district error:",
				error
			);

			alert(
				"Something went wrong while creating district."
			);
		}
	};

	const loadDistricts = async () => {
		try {
			setLoadingDistricts(true);
			setDistrictError("");

			const response = await listDistricts();

			console.log("District list response:", response);

			if (response?.success) {
				setDistricts(response.data || []);
			} else {
				setDistrictError(
					response?.message || "Failed to load districts."
				);
			}
		} catch (error) {
			console.error("District list error:", error);

			setDistrictError(
				"Unable to load district list."
			);
		} finally {
			setLoadingDistricts(false);
		}
	};

	useEffect(() => {
		loadDistricts();
	}, []);

	// useEffect(() => {
	// 	fetch("/gis/districts.geojson")
	// 		.then((response) => {
	// 			if (!response.ok) {
	// 				throw new Error(
	// 					`Failed to load districts: ${response.status}`
	// 				);
	// 			}

	// 			return response.json();
	// 		})
	// 		.then((data) => {
	// 			// console.log("District GeoJSON:", data);
	// 			setDistrictData(data);
	// 		})
	// 		.catch((error) => {
	// 			console.error(
	// 				"District GeoJSON error:",
	// 				error
	// 			);
	// 		});
	// }, []);

	const handleDistrictSelect = (district) => {

		console.log(
			"Selected district:",
			district
		);


		/*
		|--------------------------------------------------------------------------
		| Select district
		|--------------------------------------------------------------------------
		*/

		setSelectedDistrict(
			district
		);


		/*
		|--------------------------------------------------------------------------
		| Set marker at exact clicked point
		|--------------------------------------------------------------------------
		*/

		setPosition({

			lat: district.latitude,

			lng: district.longitude,

		});


		/*
		|--------------------------------------------------------------------------
		| Update form
		|--------------------------------------------------------------------------
		*/

		setForm((previous) => ({

			...previous,

			name:
				district.name || "",

			latitude:
				district.latitude?.toFixed(6) || "",

			longitude:
				district.longitude?.toFixed(6) || "",

		}));

	};

	return (
		<div className="w-full min-h-screen bg-gray-50 p-6">

			{/* =====================================================
          Page Header
      ====================================================== */}

			<div className="mb-6">

				<h1 className="text-2xl font-semibold text-gray-800">
					District Location
				</h1>

				<p className="mt-1 text-sm text-gray-500">
					Add and manage district location information.
				</p>

			</div>


			{/* =====================================================
          Main Content
      ====================================================== */}

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">


				{/* ===================================================
            District Form
        ==================================================== */}

				<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

					<h2 className="mb-6 text-lg font-semibold text-gray-800">
						District Details
					</h2>


					<form
						onSubmit={handleSubmit}
						className="space-y-5"
					>


						{/* District Name */}

						<div>
							<label className="mb-2 block text-sm font-medium text-gray-700">
								District Name
							</label>

							<input
								type="text"
								name="name"
								value={form.name}
								onChange={handleChange}
								placeholder="Enter district name"
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							/>
						</div>


						{/* Address */}

						<div>
							<label className="mb-2 block text-sm font-medium text-gray-700">
								Address
							</label>

							<textarea
								name="address"
								value={form.address}
								onChange={handleChange}
								placeholder="Enter district address"
								rows={4}
								className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							/>
						</div>


						{/* Latitude / Longitude */}

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

							<div>

								<label className="mb-2 block text-sm font-medium text-gray-700">
									Latitude
								</label>

								<input
									type="number"
									step="any"
									name="latitude"
									value={form.latitude}
									onChange={handleChange}
									placeholder="22.572600"
									className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
								/>

							</div>


							<div>

								<label className="mb-2 block text-sm font-medium text-gray-700">
									Longitude
								</label>

								<input
									type="number"
									step="any"
									name="longitude"
									value={form.longitude}
									onChange={handleChange}
									placeholder="88.363900"
									className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
								/>

							</div>

						</div>


						{/* Storage Location */}

						<div>

							<label className="mb-2 block text-sm font-medium text-gray-700">
								Storage Location
							</label>

							<input
								type="text"
								name="storage_location"
								value={form.storage_location}
								onChange={handleChange}
								placeholder="Enter storage location"
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							/>

						</div>


						{/* Buttons */}

						<div className="flex gap-3 pt-2">

							<button
								type="submit"
								className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
							>
								Save District
							</button>

							<button
								type="button"
								onClick={() => {
									setForm({
										name: "",
										address: "",
										latitude: "",
										longitude: "",
										storage_location: "",
									});

									setPosition(null);
									setSelectedDistrict(null);
								}}
								className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
							>
								Reset
							</button>

						</div>

					</form>

				</div>


				{/* ===================================================
            Map
        ==================================================== */}

				<div className="relative z-0 isolate overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

					<div className="border-b border-gray-200 px-5 py-4">

						<div className="flex items-center justify-between">

							<div>

								<h2 className="text-lg font-semibold text-gray-800">
									District Location
								</h2>

								<p className="mt-1 text-sm text-gray-500">
									{selectedDistrict
										? `Click inside ${selectedDistrict.name} to set the location.`
										: "Select a district first, then click inside its boundary."
									}
								</p>

							</div>

						</div>

					</div>


					<div className="relative z-0 h-[600px] w-full">

						<MapContainer
							center={[24.2726, 88.3639]}
							zoom={6.8}
							minZoom={6.5}
							maxZoom={12}
							maxBounds={WEST_BENGAL_BOUNDS}
							maxBoundsViscosity={1.0}
							scrollWheelZoom={true}
							className="h-full w-full"
						>

							{/* <TileLayer
								attribution='&copy; OpenStreetMap contributors'
								url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
								maxZoom={19}
							/> */}

							<LocationMarker
								position={position}
								setPosition={handleMapPosition}
								selectedDistrict={selectedDistrict}
							/>

							<DistrictLayer
								selectedDistrict={selectedDistrict}
								onDistrictSelect={handleDistrictSelect}
							/>

						</MapContainer>

					</div>


					{/* Coordinate Information */}

					<div className="border-t border-gray-200 bg-gray-50 px-5 py-4">

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

							<div>
								<p className="text-xs font-medium uppercase tracking-wide text-gray-500">
									Latitude
								</p>

								<p className="mt-1 text-sm font-semibold text-gray-800">
									{form.latitude || "--"}
								</p>
							</div>

							<div>
								<p className="text-xs font-medium uppercase tracking-wide text-gray-500">
									Longitude
								</p>

								<p className="mt-1 text-sm font-semibold text-gray-800">
									{form.longitude || "--"}
								</p>
							</div>

						</div>

					</div>

				</div>

			</div>

			<div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">

				{/* Table Header */}
				<div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

					<div>
						<h2 className="text-lg font-semibold text-gray-800">
							District List
						</h2>

						<p className="mt-1 text-sm text-gray-500">
							Manage district location records.
						</p>
					</div>

					<button
						type="button"
						onClick={loadDistricts}
						className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
					>
						Refresh
					</button>

				</div>


				{/* Loading */}
				{loadingDistricts && (
					<div className="px-5 py-8 text-center text-sm text-gray-500">
						Loading districts...
					</div>
				)}


				{/* Error */}
				{!loadingDistricts && districtError && (
					<div className="px-5 py-8 text-center text-sm text-red-500">
						{districtError}
					</div>
				)}


				{/* Table */}
				{!loadingDistricts && !districtError && (
					<div className="overflow-x-auto">

						<table className="min-w-[1000px] divide-y divide-gray-200">

							<thead className="bg-gray-50">

								<tr>

									<th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
										S.No.
									</th>

									<th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
										District
									</th>

									<th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
										Address
									</th>

									<th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
										Latitude
									</th>

									<th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
										Longitude
									</th>

									<th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
										Storage Location
									</th>

								</tr>

							</thead>


							<tbody className="divide-y divide-gray-200 bg-white">

								{districts.length > 0 ? (

									districts.map((district, index) => (

										<tr
											key={district.id}
											className="transition hover:bg-gray-50"
										>

											<td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
												{index + 1}
											</td>

											<td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-800">
												{district.name}
											</td>

											<td className="px-5 py-4 text-sm text-gray-600">
												{district.address || "-"}
											</td>

											<td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
												{district.latitude || "-"}
											</td>

											<td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
												{district.longitude || "-"}
											</td>

											<td className="px-5 py-4 text-sm text-gray-600">
												{district.storage_location || "-"}
											</td>

										</tr>

									))

								) : (

									<tr>

										<td
											colSpan="6"
											className="px-5 py-8 text-center text-sm text-gray-500"
										>
											No districts found.
										</td>

									</tr>

								)}

							</tbody>

						</table>

					</div>
				)}

			</div>
		</div>
	);
}

export default DistrictLocation;