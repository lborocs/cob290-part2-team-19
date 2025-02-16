export const fetchGuidesByCategory = async (categoryId: number) => {
    try {
        const response = await fetch(`http://localhost:3300/guides/${categoryId}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("❌ Error: Fetched guides are not an array!", data);
            return [];
        }

        return data;
    } catch (error) {
        console.error("❌ Error fetching guides:", error);
        return [];
    }
};