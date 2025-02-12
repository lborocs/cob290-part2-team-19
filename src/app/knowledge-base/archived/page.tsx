"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/app/layout/page"

interface Guide {
  id: string;
  title: string;
  category: string;
  author: string | null;
  content: string;
}

const ArchivedKnowledgeBase = () => {
  const [archivedGuides, setArchivedGuides] = useState<Guide[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load archived guides from localStorage on component mount
  useEffect(() => {
    const archived = localStorage.getItem("archivedGuides");
    if (archived) {
      try {
        const guides = JSON.parse(archived);
        setArchivedGuides(guides);
      } catch (error) {
        console.error("Error parsing archived guides from localStorage", error);
      }
    }
  }, []);

  // Permanently delete an archived guide
  const deleteArchivedGuide = (guideId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this guide?")) {
      const updatedArchived = archivedGuides.filter((guide) => guide.id !== guideId);
      setArchivedGuides(updatedArchived);
      localStorage.setItem("archivedGuides", JSON.stringify(updatedArchived));
    }
  };



  // Filter archived guides based on the search query
  const filteredArchived = archivedGuides.filter((guide) =>
    guide.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout tabName="Archived Knowledge Base" icon={<i className="fa-solid fa-archive" />}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Archived Knowledge Base</h1>
        <div className="mb-6">
          <input 
            type="text"
            placeholder="Search Archived Guides..."
            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {filteredArchived.length === 0 ? (
          <p>No archived guides found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArchived.map((guide) => (
              <div
                key={guide.id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg"
              >
                <h3 className="text-lg font-semibold">{guide.title}</h3>
                <p className="text-sm text-gray-500">Category: {guide.category}</p>
                <p className="text-sm text-gray-500">
                  Created by: {guide.author || "No Author"}
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    onClick={() => restoreGuide(guide)}
                  >
                    Restore
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    onClick={() => deleteArchivedGuide(guide.id)}
                  >
                    Delete Permanently
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ArchivedKnowledgeBase;
