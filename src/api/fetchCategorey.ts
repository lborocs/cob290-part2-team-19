export const fetchCategories = async () => {
    try {
        const response = await fetch("http://localhost:3300/categories");
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("Fetched categories are not an array:", data);
            return [];
        }

        return data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};

export const addCategory = async (categoryName: string) => {
    try {
        const response = await fetch("http://localhost:3300/add_category", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ category_name: categoryName }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to add category");
        }

        return data.category;
    } catch (error) {
        console.error("Error adding category:", error);
        return null;
    }
};
