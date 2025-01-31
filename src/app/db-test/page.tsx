import Layout from '../layout/page';


export default async function DBTest() {
    // To run this test, you must have a running server on localhost:3300
    // One has been provided in the root directory of the project
    // You can run it by running 'py db.py' in the root directory
    
    // 4 endpoints for DB
    // create (POST)   - must have a body of (name: string, age: number)
    // read   (GET)    - must have a query param of (id: number)
    // update (PUT)    - must have a query of (id:number) and body of (name: string, age: number)
    // delete (DELETE) - must have a query param of (id: number)
    let json = null;
    try {
        const response = await fetch('http://localhost:3300/read/1');
        json = JSON.stringify(await response.json());
    } catch (e) {

    }

    return (
        <Layout tabName={"DB Test"}>
            <div>Data: {json ?? "Could not fetch data"}</div>
        </Layout>
    )
}