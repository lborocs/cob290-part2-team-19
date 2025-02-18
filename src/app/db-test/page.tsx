import Layout from '../layout/page';

import { BASE_URL } from '@/api/globals'
export default async function DBTest() {
    let json = null;
    try {
        const response = await fetch(`${BASE_URL}/query?sql=SELECT name FROM sqlite_master WHERE type='table'`);
        json = JSON.stringify(await response.json());
    } catch (e) {

    }

    return (
        <Layout tabName={"DB Test"}>
            <div>Data: {json ?? "Could not fetch data"}</div>
        </Layout>
    )
}
