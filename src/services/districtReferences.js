const WEST_BENGAL_DISTRICTS_API =
	"https://api.openadmindata.org/api/v1/in/state/west-bengal-in22.json";

export const fetchWestBengalDistricts =
	async () => {
		const response = await fetch(
			WEST_BENGAL_DISTRICTS_API
		);

		if (!response.ok) {
			throw new Error(
				"Failed to fetch West Bengal district reference data."
			);
		}

		const data =
			await response.json();

		return (
			data?.children?.entities ||
			[]
		);
	};