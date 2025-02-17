import { BASE_URL } from "./globals";// Change if hosted elsewhere
export const fetchCategories = async () => {
    try {
        const response = await fetch(`${BASE_URL}/categories`);
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
        const response = await fetch(`${BASE_URL}/add_category`, {
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
export const deleteCategory = async (categoryId: number) => {
    try {
        const response = await fetch(`http://localhost:3300/delete_category/${categoryId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to delete category.");
        }

        return data;
    } catch (error) {
        console.error("❌ Error deleting category:", error);
        return null;
    }
};
export const updateCategory = async (categoryId: number, newName: string) => {
    try {
        const response = await fetch(`http://localhost:3300/update_category/${categoryId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                category_name: newName,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to update category");
        }

        return data;
    } catch (error) {
        console.error("Error updating category:", error);
        return null;
    }
};

