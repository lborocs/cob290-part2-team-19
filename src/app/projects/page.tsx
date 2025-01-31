import Layout from '../layout/page';

import React from 'react';

export default function ProjectsPage() {
  return (
    <Layout tabName="Projects" icon={<i className="fa-solid fa-project-diagram"></i>}>
      <div>
        <h2 className="text-2xl font-bold mb-4">Projects</h2>
        <p>Welcome to the Projects page!</p>
      </div>
    </Layout>
  );
}