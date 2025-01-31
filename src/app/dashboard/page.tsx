import Layout from '../layout/page';
import React from 'react';

export default function NewProjectPage() {
  return (
    <Layout tabName={"Dashboard"} icon={<i className="fa-solid fa-table-columns"></i>}>
      <div>
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <p>Welcome to the Dashboard!</p>
      </div>
    </Layout>
  );
}