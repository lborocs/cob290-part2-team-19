const BASE_URL = "http://35.240.24.117:3300" // Change if hosted elsewhere

export const fetchGuidesByCategory = async (categoryId: number) => {
    try {
        const response = await fetch(`${BASE_URL}/guides/${categoryId}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("Error: Fetched guides are not an array!", data);
            return [];
        }

        return data;
    } catch (error) {
        console.error("Error fetching guides:", error);
        return [];
    }
};
export const addGuide = async (authorId: number, content: string, categoryId: number) => {
    try {
        const response = await fetch(`${BASE_URL}/add_post`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                author_id: authorId,
                content,
                category_id: categoryId,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to add guide");
        }

        return data; 
    } catch (error) {
        console.error("Error adding guide:", error);
        return null; 
    }
};