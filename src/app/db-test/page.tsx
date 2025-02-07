import Layout from '../layout/page';


export default async function DBTest() {
    let json = null;
    try {
        const response = await fetch("http://localhost:3300/query?sql=SELECT name FROM sqlite_master WHERE type='table'");
        json = JSON.stringify(await response.json());
    } catch (e) {

    }

    return (
        <Layout tabName={"DB Test"}>
            <div>Data: {json ?? "Could not fetch data"}</div>
        </Layout>
    )
}
