export const fetchCategories = async () => {
    try {
        const response = await fetch("http://localhost:3300/categories");
        const data = await response.json();
        if (!Array.isArray(data)) {
            console.error("Categories data is not an array!", data);
            return [];
        }
        return data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};