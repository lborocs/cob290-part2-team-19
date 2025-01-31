import Layout from '../layout/page';
import React from 'react';

export default function TasksPage() {
  return (
    <Layout tabName="Tasks" icon={<i className="fa-solid fa-tasks"></i>}>
      <div>
        <h2 className="text-2xl font-bold mb-4">Tasks</h2>
        <p>Welcome to the Tasks page!</p>
      </div>
    </Layout>
  );
}