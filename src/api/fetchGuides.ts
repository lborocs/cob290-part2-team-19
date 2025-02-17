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
export const addGuide = async (authorId: number, content: string, categoryId: number) => {
    try {
        const response = await fetch("http://localhost:3300/add_post", {
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

        const data = await response.json();  // ✅ Fetch JSON response

        if (!response.ok) {
            throw new Error(data.error || "Failed to add guide");  // ✅ Throw error if API fails
        }

        return data;  // ✅ Ensure the function returns the API response
    } catch (error) {
        console.error("❌ Error adding guide:", error);
        return null;  // ✅ Return null on failure
    }
};
export const deletePost = async (postId: number) => {
    try {
        const response = await fetch(`http://localhost:3300/delete_post/${postId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to delete post");
        }

        return data;
    } catch (error) {
        console.error("❌ Error deleting post:", error);
        return null;
    }
};