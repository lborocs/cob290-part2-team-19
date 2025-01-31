import Layout from '../layout/page';
import React from 'react';

export default function NewProjectPage() {
  return (
    <Layout tabName={"Create New Project"} icon={<i className="fa-regular fa-square-plus"></i>}>
      <div>
        <h2 className="text-2xl font-bold mb-4">Create Project</h2>
        <p>Welcome to the New Projectpage!</p>
      </div>
    </Layout>
  );
}