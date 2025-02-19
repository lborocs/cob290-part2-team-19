"use client";
import React, { useState, useEffect } from "react";
import Layout from "../layout/page";
import Link from "next/link";
import { fetchCategories, deleteCategory, updateCategory } from "@/api/fetchCategory";
import { fetchGuidesByCategory, addGuide as addGuideAPI, deletePost } from "@/api/fetchGuides";
import { BASE_URL } from '@/api/globals'

interface Guide {
  id: string;
  title: string;
  category: string;
  author: string | null;
  content: string;
}

interface Category {
  category_id: number;
  name: string;
  guides: Guide[];
  author: string | null;
  color: string;
}

const KnowledgeBasePage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // For category search
  const [guideSearchQuery, setGuideSearchQuery] = useState(""); // Universal guide search
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false); // Toggle for create category modal
  const [newCategoryName, setNewCategoryName] = useState("");

  const [isCreatingGuide, setIsCreatingGuide] = useState(false);
  const [newGuideName, setNewGuideName] = useState("");
  const [newGuideContent, setNewGuideContent] = useState("");
  const [newGuideAuthor, setNewGuideAuthor] = useState("Current User");

  // New state for editing category
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  // New state for editing guide
  const [isEditingGuide, setIsEditingGuide] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [editGuideName, setEditGuideName] = useState("");
  const [editGuideContent, setEditGuideContent] = useState("");
  const [editGuideAuthor, setEditGuideAuthor] = useState("Current User");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log("Fetching categories...");
        const categoriesData = await fetchCategories();

        if (!Array.isArray(categoriesData)) {
          console.error("Error: Fetched categories are not an array!", categoriesData);
          return;
        }

        // ✅ Check if fetchGuidesByCategory exists
        if (typeof fetchGuidesByCategory !== "function") {
          console.error("❌ Error: fetchGuidesByCategory is missing or undefined.");
          return;
        }

        // ✅ Fetch guides for each category
        const categoriesWithGuides = await Promise.all(
          categoriesData.map(async (cat): Promise<Category | null> => {
            if (!cat.category_id) {
              console.warn(`⚠️ Skipping category without ID: ${cat.name}`);
              return null;
            }

            try {
              const guides = await fetchGuidesByCategory(cat.category_id);
              console.log(`📌 Fetched ${guides.length} guides for category: ${cat.name}`);

              return {
                category_id: cat.category_id,
                name: cat.name,
                guides: Array.isArray(guides) ? guides : [], // ✅ Ensure guides is always an array
                author: cat.author || "Unknown",
                color: cat.color || "bg-gradient-to-r from-yellow-400 to-yellow-600",
              };
            } catch (error) {
              console.error(`❌ Failed to fetch guides for category: ${cat.name}`, error);
              return null;
            }
          })
        );

        // ✅ Correct TypeScript Type Filtering (No More Errors!)
        const validCategories: Category[] = categoriesWithGuides.filter(
          (cat): cat is Category => cat !== null && typeof cat.category_id !== "undefined"
        );

        console.log("✅ Final Categories with Guides:", validCategories);
        setCategories(validCategories);
      } catch (error) {
        console.error("❌ Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  // Universal guide search
  const allGuides = categories.flatMap((category) => category.guides);
  const filteredGuides = allGuides.filter((guide) =>
    guide.title.toLowerCase().startsWith(guideSearchQuery.toLowerCase())
  );

  // Guides within the selected category
  const selectedCategoryObject = categories.find(category => category.name === selectedCategory);

  const selectedCategoryGuides = selectedCategoryObject
    ? selectedCategoryObject.guides.filter(guide =>
      guide.title.toLowerCase().startsWith(guideSearchQuery.toLowerCase())
    )
    : [];

  // Create Category
  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Category name cannot be empty.");
      return;
    }

    // ✅ Ensure no duplicate category names locally
    const isDuplicate = categories.some(
      (category) =>
        category.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    if (isDuplicate) {
      alert("Category name already exists.");
      return;
    }

    try {
      console.log("🟡 Sending request to API...");

      // ✅ Send API request to Flask backend
      const response = await fetch(`${BASE_URL}/add_category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category_name: newCategoryName.trim() }),
      });

      const data = await response.json();
      console.log("🟢 API response received:", data);

      if (!response.ok) {
        throw new Error(` added category: ${data.error || response.statusText}`);
      }

      // ✅ Ensure API response contains a valid `category_id`
      if (!data.category || !data.category.category_id) {
        throw new Error("API response missing category_id.");
      }

      // ✅ Properly formatted new category with category_id
      const newCategory: Category = {
        category_id: data.category.category_id, // ✅ Ensure category_id exists
        name: data.category.name,
        color:
          data.category.color ||
          `bg-gradient-to-r from-${randomColor()}-400 to-${randomColor()}-600`,
        author: data.category.author || "Unknown",
        guides: [], // No guides initially
      };

      // ✅ Update UI after successful API call
      setCategories([...categories, newCategory]);

      alert("Category added successfully!");
      setNewCategoryName("");
      setIsCreatingCategory(false);
    } catch (error) {
      console.error("❌ Error adding category:", error);
      alert("added category.");
    }
  };

  // Function to generate a random color from a preset list
  const randomColor = () => {
    const colors = ["yellow", "blue", "red", "green", "purple", "pink"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // add guide
  const addGuide = async () => {
    if (!newGuideName.trim() || !newGuideContent.trim()) {
      alert("Guide name and content cannot be empty.");
      return;
    }

    const currentCategory = categories.find(
      (category) => category.name === selectedCategory
    );

    if (!currentCategory) {
      alert("Error: Category not found.");
      return;
    }

    try {
      console.log("🟡 Sending request to API to add guide...");

      // ✅ Use `addGuideAPI` to avoid naming conflicts
      const response = await addGuideAPI(1, newGuideContent.trim(), currentCategory.category_id);

      if (!response || response.error) {
        alert(`Failed to add guide: ${response?.error || "Unknown error"}`);
        return;
      }

      console.log("🟢 Guide added successfully:", response);

      // ✅ Fetch updated guides from API
      const updatedGuides = await fetchGuidesByCategory(currentCategory.category_id);

      // ✅ Update categories state with new guide
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.category_id === currentCategory.category_id
            ? { ...category, guides: updatedGuides }
            : category
        )
      );

      // ✅ Reset UI state
      setNewGuideName("");
      setNewGuideContent("");
      setNewGuideAuthor("Current User");
      setIsCreatingGuide(false);

      alert("Guide added successfully!");
    } catch (error) {
      console.error("❌ Error adding guide:", error);
      alert("Failed to add guide.");
    }
  };

  // Delete Category
  const deleteCategoryHandler = async (categoryId: number, categoryName: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm(`Are you sure you want to delete "${categoryName}" and all its guides?`)) {
      return;
    }

    try {
      console.log(`🟡 Deleting category ID: ${categoryId}...`);

      // ✅ Call API to delete category and its guides
      const response = await deleteCategory(categoryId);
      if (!response || !response.success) {
        throw new Error("Failed to delete category.");
      }

      console.log("🟢 Category deleted successfully.");

      // ✅ Fetch updated categories from backend to prevent orphaned guides
      const updatedCategories = await fetchCategories();
      setCategories(updatedCategories);

      // ✅ Reset selected category if deleted
      // ✅ Reset selected category if deleted
      if (selectedCategory && typeof selectedCategory === "string" && selectedCategory === categoryName) {
        setSelectedCategory(null);
      }

      alert(`Category "${categoryName}" deleted successfully!`);
    } catch (error) {
      console.error("❌ Error deleting category:", error);
      alert("Failed to delete category.");
    }
  };



  // Open Edit Category Modal
  const openEditCategoryModal = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToEdit(category);
    setEditCategoryName(category.name);
    setIsEditingCategory(true);
  };

  // Save Category Edit
  const saveCategoryEdit = async () => {
    if (!editCategoryName.trim()) {
      alert("Category name cannot be empty.");
      return;
    }

    // Check for duplicate names (ignoring the category being edited)
    const isDuplicate = categories.some(
      (cat) =>
        cat.name.toLowerCase() === editCategoryName.trim().toLowerCase() &&
        cat.name !== categoryToEdit?.name
    );
    if (isDuplicate) {
      alert("Another category with that name already exists.");
      return;
    }

    if (!categoryToEdit) {
      alert("No category selected for editing.");
      return;
    }

    // Call the updateCategory API to update the category name in the backend
    const updateResponse = await updateCategory(categoryToEdit.category_id, editCategoryName.trim());

    if (!updateResponse) {
      alert("Failed to update category.");
      return;
    }

    // Update category name in the frontend state
    const updatedCategories = categories.map((cat) => {
      if (cat.category_id === categoryToEdit.category_id) {
        const updatedGuides = cat.guides.map((guide) => ({
          ...guide,
          category: editCategoryName.trim(), // Update guide's category name if necessary
        }));
        return { ...cat, name: editCategoryName.trim(), guides: updatedGuides };
      }
      return cat;
    });

    setCategories(updatedCategories);

    // If the selected category was edited, update the selected category name
    if (selectedCategory === categoryToEdit.name) {
      setSelectedCategory(editCategoryName.trim());
    }

    // Close the modal and reset the inputs
    setIsEditingCategory(false);
    setCategoryToEdit(null);
    setEditCategoryName("");

    alert("Category updated successfully!");
  };


  // Delete Guide
  const deleteGuide = async (guideId: number) => {
    if (!window.confirm("Are you sure you want to delete this guide?")) {
      return;
    }

    try {
      console.log("🟡 Deleting guide...");

      // Call API to delete guide
      const response = await deletePost(guideId);

      if (!response || response.error) {
        alert("Failed to delete guide.");
        return;
      }

      console.log("🟢 Guide deleted successfully!");

      // ✅ Ensure guide.id is a number before comparison
      const updatedCategories = categories.map((cat) => ({
        ...cat,
        guides: cat.guides.filter((guide) => Number(guide.id) !== guideId),
      }));
      setCategories(updatedCategories);

      // ✅ Ensure selectedGuide.id is a number before comparison
      if (selectedGuide && Number(selectedGuide.id) === guideId) {
        setSelectedGuide(null);
      }
    } catch (error) {
      console.error("❌ Error deleting guide:", error);
      alert("Failed to delete guide.");
    }
  };

  // Open Edit Guide Modal
  const openEditGuideModal = (guide: Guide) => {
    setEditingGuide(guide);
    setEditGuideName(guide.title);
    setEditGuideContent(guide.content);
    setEditGuideAuthor(guide.author || "Current User");
    setIsEditingGuide(true);
  };

  // Save Guide Edit
  const saveGuideEdit = () => {
    if (!editGuideName.trim() || !editGuideContent.trim()) {
      alert("Guide name and content cannot be empty.");
      return;
    }
    const updatedCategories = categories.map((cat) => {
      if (cat.name === editingGuide?.category) {
        const updatedGuides = cat.guides.map((guide) => {
          if (guide.id === editingGuide?.id) {
            return {
              ...guide,
              title: editGuideName.trim(),
              content: editGuideContent.trim(),
              author: editGuideAuthor === "No Author" ? null : editGuideAuthor,
            };
          }
          return guide;
        });
        return { ...cat, guides: updatedGuides };
      }
      return cat;
    });
    setCategories(updatedCategories);
    if (selectedGuide && editingGuide && selectedGuide.id === editingGuide.id) {
      setSelectedGuide({
        ...selectedGuide,
        title: editGuideName.trim(),
        content: editGuideContent.trim(),
        author: editGuideAuthor === "No Author" ? null : editGuideAuthor,
      });
    }

    setIsEditingGuide(false);
    setEditingGuide(null);
    setEditGuideName("");
    setEditGuideContent("");
    setEditGuideAuthor("Current User");
  };

  return (
    <Layout tabName="Knowledge Base" icon={<i className="fa-solid fa-book" />}>
      <div className="p-4">

        {/* Main Container */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Search Bars */}
          {!selectedCategory && !selectedGuide && (
            <div className="mb-6 flex gap-4">
              <input
                type="text"
                placeholder="Search by Category..."
                className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <input
                type="text"
                placeholder="Search Guides (Universal)..."
                className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) => setGuideSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* Back Buttons */}
          {selectedCategory && !selectedGuide && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="mb-4 px-4 py-2 bg-gray-300 text-gray-700 rounded shadow"
            >
              Back to Categories
            </button>
          )}
          {selectedGuide && (
            <button
              onClick={() => setSelectedGuide(null)}
              className="mb-4 px-4 py-2 bg-gray-300 text-gray-700 rounded shadow"
            >
              Back to Guides
            </button>
          )}
          {/* Categories View */}
          {!selectedCategory && !selectedGuide && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.length > 0 ? (
                filteredCategories.map((category) => (
                  <div
                    key={category.category_id}
                    className={`p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer ${category.color}`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <h2 className="text-xl font-bold mb-2">{category.name}</h2>
                    <p className="text-sm">Created by: {category.author || "Unknown"}</p>
                    <p className="text-sm mb-2">{category.guides.length} guides</p>

                    {/* Edit and Delete Buttons for Category */}
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                        onClick={(e) => openEditCategoryModal(category, e)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                        onClick={(e) => deleteCategoryHandler(category.category_id, category.name, e)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No categories found.</p>
              )}
            </div>
          )}

          {/* Guides View */}
          {selectedCategory && !selectedGuide && (
            <>
              {/* Button to open Create Guide Modal */}
              <button
                className="mb-4 px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600"
                onClick={() => setIsCreatingGuide(true)}
              >
                <i className="fa-solid fa-plus"></i> Create Guide
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedCategoryGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
                    onClick={() => setSelectedGuide(guide)}
                  >
                    <h3 className="text-lg font-semibold">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Created by: {guide.author || "No Author"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Category: {guide.category}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Guide Detail View */}
          {selectedGuide && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex gap-2 mb-4">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={() => openEditGuideModal(selectedGuide)}
                >
                  Edit Guide
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded"
                  onClick={() => deleteGuide(Number(selectedGuide.id))}
                >
                  Delete Guide
                </button>
              </div>
              <h2 className="text-2xl font-bold mb-4">
                {selectedGuide.title}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Created by: {selectedGuide.author || "No Author"}
              </p>
              <p className="text-gray-700">{selectedGuide.content}</p>
            </div>
          )}

          {/* Add Category Button */}
          <div
            className="fixed bottom-4 left-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow-md cursor-pointer"
            onClick={() => setIsCreatingCategory(true)}
          >
            <i className="fa-solid fa-plus"></i> Add Category
          </div>

          {/* Universal Guide Search Results */}
          {!selectedCategory && guideSearchQuery && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {filteredGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg"
                >
                  <h3 className="text-lg font-semibold">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Category: {guide.category}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created by: {guide.author || "No Author"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Guide Modal */}
      {isCreatingGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Create New Guide</h3>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Guide Name"
              value={newGuideName}
              onChange={(e) => setNewGuideName(e.target.value)}
            />
            <textarea
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Guide Content"
              rows={4}
              value={newGuideContent}
              onChange={(e) => setNewGuideContent(e.target.value)}
            />
            <select
              className="w-full p-2 border border-gray-300 rounded mb-4"
              value={newGuideAuthor}
              onChange={(e) => setNewGuideAuthor(e.target.value)}
            >
              <option value="Current User">Current User</option>
              <option value="No Author">No Author</option>
            </select>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                onClick={() => setIsCreatingGuide(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={addGuide}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {isCreatingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Create New Category</h3>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                onClick={() => setIsCreatingCategory(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={addCategory}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Edit Category</h3>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
            />
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                onClick={() => setIsEditingCategory(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={saveCategoryEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Guide Modal */}
      {isEditingGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Edit Guide</h3>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Guide Name"
              value={editGuideName}
              onChange={(e) => setEditGuideName(e.target.value)}
            />
            <textarea
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Guide Content"
              rows={4}
              value={editGuideContent}
              onChange={(e) => setEditGuideContent(e.target.value)}
            />
            <select
              className="w-full p-2 border border-gray-300 rounded mb-4"
              value={editGuideAuthor}
              onChange={(e) => setEditGuideAuthor(e.target.value)}
            >
              <option value="Current User">Current User</option>
              <option value="No Author">No Author</option>
            </select>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                onClick={() => setIsEditingGuide(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={saveGuideEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default KnowledgeBasePage;

