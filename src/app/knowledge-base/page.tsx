import Layout from '../layout/page';
import React from 'react';

export default function KnowledgeBasePage() {
  return (
    <Layout tabName={"Knowledge Base"} icon={<i className="fa-solid fa-book"></i>}>
      <div>
        <h2 className="text-2xl font-bold mb-4">Knowledge Base</h2>
        <p>Welcome to the Knowledge Base!</p>
      </div>
    </Layout>
  );
}