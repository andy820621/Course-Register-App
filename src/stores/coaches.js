import { computed, reactive, ref } from "vue";
import { defineStore } from "pinia";

export const useCouchesStore = defineStore("coaches", () => {
	// state
	const coaches = reactive([
		// {
		// 	id: "c1",
		// 	firstName: "Maximilian",
		// 	lastName: "Schwarzmuller",
		// 	areas: ["frontend", "backend", "career"],
		// 	description:
		// 		"I'm Maximilian and I've worked as a freelance web developer for years. Let me help you become a developer as well~",
		// 	hourlyRate: 30,
		// },
		// {
		// 	id: "c2",
		// 	firstName: "Julie",
		// 	lastName: "Jones",
		// 	areas: ["frontend", "career"],
		// 	description:
		// 		"I'm Julie and I've a senior developer in a big tech company, I can help you get your first job or progress in your current role.",
		// 	hourlyRate: 30,
		// },
	]);
	const userId = ref("c3");
	const lastFetch = ref(null);

	// Computed || getters
	const hasCoaches = computed(() => coaches && coaches.length > 0);
	const userIsCoach = computed(() =>
		coaches.some((coach) => coach.id === userId.value)
	);
	const shouldUpdate = computed(() => {
		if (!lastFetch.value) return true;

		const currentTimeStamp = new Date().getTime();
		return (currentTimeStamp - lastFetch.value) / 1000 > 60;
	});

	// Methed || actions
	async function registerCoach(data) {
		const coach = {
			...data,
		};

		const response = await fetch(
			`https://vue-findcoaches-data-default-rtdb.asia-southeast1.firebasedatabase.app/coaches/${userId.value}.json`,
			{
				method: "PUT",
				body: JSON.stringify(coach),
			}
		);
		// const responseData = await response.json();

		if (!response.ok) {
			throw new Error(responseData.message || "Failed to register!");
		}

		coaches.push({
			...coach,
			id: userId.value,
		});
	}

	async function fetchCoaches(ForceRefreshBoolean) {
		if (!ForceRefreshBoolean && !shouldUpdate.value) return;

		const response = await fetch(
			`https://vue-findcoaches-data-default-rtdb.asia-southeast1.firebasedatabase.app/coaches.json`
		);
		const responseData = await response.json();

		if (!response.ok) {
			throw new Error(responseData.message || "Failed to fetch!");
		}

		const results = [];

		for (let key in responseData) {
			const coach = {
				id: key,
				firstName: responseData[key].firstName,
				lastName: responseData[key].lastName,
				areas: responseData[key].areas,
				description: responseData[key].description,
				hourlyRate: responseData[key].hourlyRate,
			};
			results.push(coach);
		}

		Object.assign(coaches, results);

		setFetchTimestamp();
	}

	function setFetchTimestamp() {
		lastFetch.value = new Date().getTime();
	}

	return {
		coaches,
		userId,
		lastFetch,
		hasCoaches,
		userIsCoach,
		registerCoach,
		fetchCoaches,
		setFetchTimestamp,
	};
});
