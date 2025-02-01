"use client";
import React, { useState, useEffect } from "react";
import Layout from "../layout/page";

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
  const [isCreatingCategory, setIsCreatingCategory] = useState(false); // To toggle the category modal
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingGuide, setIsCreatingGuide] = useState(false); // For Create Guide Modal
  const [newGuideName, setNewGuideName] = useState("");
  const [newGuideContent, setNewGuideContent] = useState("");
  const [newGuideAuthor, setNewGuideAuthor] = useState("Current User");

  useEffect(() => {
    // Mock Data - Replace with database fetch when ready
    setCategories([
      {
        name: "General",
        color: "bg-gradient-to-r from-yellow-400 to-yellow-600",
        author: "John Doe",
        guides: [
          {
            id: "1",
            title: "Project Setup Guide",
            category: "General",
            author: "Alice Johnson",
            content:
              "This guide explains how to set up a new project step by step.",
          },
          {
            id: "2",
            title: "Team Collaboration",
            category: "General",
            author: null,
            content: "Learn how to collaborate effectively in a team.",
          },
        ],
      },
      {
        name: "Admin",
        color: "bg-gradient-to-r from-blue-400 to-blue-600",
        author: "Jane Smith",
        guides: [
          {
            id: "3",
            title: "Permissions Overview",
            category: "Admin",
            author: "Robert Brown",
            content: "Understand the roles and permissions in the system.",
          },
        ],
      },
      {
        name: "Must Read",
        color: "bg-gradient-to-r from-red-400 to-red-600",
        author: "Sarah Green",
        guides: [
          {
            id: "4",
            title: "Security Protocols",
            category: "Must Read",
            author: "John Doe",
            content:
              "Essential security protocols to maintain system integrity.",
          },
        ],
      },
    ]);
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

  // Guides within a selected category
  const selectedCategoryGuides = selectedCategory
    ? categories
      .find((category) => category.name === selectedCategory)
      ?.guides.filter((guide) =>
        guide.title.toLowerCase().startsWith(guideSearchQuery.toLowerCase())
      ) ?? []
    : [];

  // Function to add a new category
  const addCategory = () => {
    if (!newCategoryName.trim()) {
      alert("Category name cannot be empty.");
      return;
    }
    // Ensure no categories have the same name
    const isDuplicate = categories.some(
      (category) =>
        category.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    if (isDuplicate) {
      alert("Category name already exists.");
      return;
    }

    setCategories([
      ...categories,
      {
        name: newCategoryName.trim(),
        color: `bg-gradient-to-r from-${randomColor()}-400 to-${randomColor()}-600`,
        author: "Current User",
        guides: [],
      },
    ]);

    setNewCategoryName("");
    setIsCreatingCategory(false);
  };

  // Function to generate a random color from a preset list
  const randomColor = () => {
    const colors = ["yellow", "blue", "red", "green", "purple", "pink"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Function to add a new guide within the selected category
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

    // Add the new guide to the current category
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

  return (
    <Layout tabName="Knowledge Base">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Hello, [User's Name]</h1>

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
              {filteredCategories.map((category) => (
                <div
                  key={category.name}
                  className={`p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer ${category.color}`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <h2 className="text-xl font-bold mb-2">{category.name}</h2>
                  <p className="text-sm">
                    Created by: {category.author || "No Author"}
                  </p>
                  <p className="text-sm">{category.guides.length} guides</p>
                </div>
              ))}
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
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg"
                    onClick={() => setSelectedGuide(guide)}
                  >
                    <h3 className="text-lg font-semibold">{guide.title}</h3>
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

          {/* Add Category Modal */}
          {isCreatingCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                <h3 className="text-xl font-bold mb-4">
                  Create New Category
                </h3>
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

          {/* Universal Guide Search Results */}
          {!selectedCategory && guideSearchQuery && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg"
                >
                  <h3 className="text-lg font-semibold">{guide.title}</h3>
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
    </Layout>
  );
};

export default KnowledgeBasePage;
