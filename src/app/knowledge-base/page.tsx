"use client";
import React, { useState, useEffect } from "react";
import Layout from "../layout/page";
import Link from "next/link";
import { fetchCategories } from "@/api/fetchCategorey";


interface Guide {
  id: string;
  title: string;
  category: string;
  author: string | null;
  content: string;
}

interface Category {
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
        const data = await fetchCategories();
        if (!Array.isArray(data)) {
          console.error("Error: Fetched categories are not an array!", data);
          return;
        }

        // Format categories to match UI structure
        const formattedCategories = data.map((cat: { category_id: number; category_name: string }) => ({
          name: cat.category_name,  // Ensure correct naming
          guides: [],  // Guides will be fetched separately
          author: "Unknown",
          color: "bg-gradient-to-r from-yellow-400 to-yellow-600",
        }));

        setCategories(formattedCategories);
      } catch (error) {
        console.error("Failed to load categories:", error);
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
  const selectedCategoryGuides = selectedCategory
    ? categories
      .find((category) => category.name === selectedCategory)
      ?.guides.filter((guide) =>
        guide.title.toLowerCase().startsWith(guideSearchQuery.toLowerCase())
      ) ?? []
    : [];

  // Create Category
  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Category name cannot be empty.");
      return;
    }

    // Ensure no duplicate category names locally
    const isDuplicate = categories.some(
      (category) =>
        category.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    if (isDuplicate) {
      alert("Category name already exists.");
      return;
    }

    // Prepare new category object for UI update
    const newCategory = {
      name: newCategoryName.trim(),
      color: `bg-gradient-to-r from-${randomColor()}-400 to-${randomColor()}-600`,
      author: "Current User",
      guides: [],
    };

    try {
      console.log("🟡 Sending request to API...");

      // Send API request to Flask backend
      const response = await fetch("http://localhost:3300/add_category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category_name: newCategory.name }),
      });

      console.log("🟢 API response received", response);

      if (!response.ok) {
        throw new Error(`Failed to add category: ${response.statusText}`);
      }

      // Update UI after successful API call
      setCategories([...categories, newCategory]);

      alert("Category added successfully!");
      setNewCategoryName("");
      setIsCreatingCategory(false);
    } catch (error) {
      console.error("❌ Error adding category:", error);
      alert("Failed to add category.");
    }
  };

  // Function to generate a random color from a preset list
  const randomColor = () => {
    const colors = ["yellow", "blue", "red", "green", "purple", "pink"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Create Guide
  const addGuide = () => {
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

    // Check for duplicate guide names within the category
    const isDuplicate = currentCategory.guides.some(
      (guide) =>
        guide.title.toLowerCase() === newGuideName.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert("Guide name already exists in this category.");
      return;
    }

    // Add the new guide
    const updatedCategories = categories.map((category) => {
      if (category.name === selectedCategory) {
        return {
          ...category,
          guides: [
            ...category.guides,
            {
              id: Date.now().toString(), // Temporary unique ID
              title: newGuideName.trim(),
              category: selectedCategory,
              author: newGuideAuthor === "No Author" ? null : newGuideAuthor,
              content: newGuideContent.trim(),
            },
          ],
        };
      }
      return category;
    });

    setCategories(updatedCategories);
    setNewGuideName("");
    setNewGuideContent("");
    setNewGuideAuthor("Current User");
    setIsCreatingGuide(false);
  };

  // Delete Category
  const deleteCategory = (categoryName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this category?")) {
      setCategories(categories.filter((cat) => cat.name !== categoryName));
      if (selectedCategory === categoryName) {
        setSelectedCategory(null);
      }
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
  const saveCategoryEdit = () => {
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
    // Update category name and update each guide's category field
    const updatedCategories = categories.map((cat) => {
      if (cat.name === categoryToEdit?.name) {
        const updatedGuides = cat.guides.map((guide) => ({
          ...guide,
          category: editCategoryName.trim(),
        }));
        return { ...cat, name: editCategoryName.trim(), guides: updatedGuides };
      }
      return cat;
    });
    setCategories(updatedCategories);
    if (selectedCategory === categoryToEdit?.name) {
      setSelectedCategory(editCategoryName.trim());
    }
    setIsEditingCategory(false);
    setCategoryToEdit(null);
    setEditCategoryName("");
  };

  // Delete Guide
  const deleteGuide = (guideId: string) => {
    if (window.confirm("Are you sure you want to delete this guide?")) {
      const updatedCategories = categories.map((cat) => ({
        ...cat,
        guides: cat.guides.filter((guide) => guide.id !== guideId),
      }));
      setCategories(updatedCategories);
      if (selectedGuide && selectedGuide.id === guideId) {
        setSelectedGuide(null);
      }
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
                    key={category.name}
                    className={`p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer ${category.color}`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <h2 className="text-xl font-bold mb-2">{category.name}</h2>
                    <p className="text-sm">Created by: {category.author || "Unknown"}</p>
                    <p className="text-sm mb-2">0 guides (To be updated)</p>

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
                        onClick={(e) => deleteCategory(category.name, e)}
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
                  onClick={() => deleteGuide(selectedGuide.id)}
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

