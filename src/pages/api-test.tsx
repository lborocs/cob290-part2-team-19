import { Suspense, useEffect, useState } from "react";
import Page from "./(Page)";

function SampleAPIRequest() {
    const [data, setData] = useState(null);
  
    useEffect(() => {
      fetch("/api/sample_request")
        .then((res) => res.json())
        .then((data) => setData(data))
        .catch((error) => console.error("Error fetching API:", error));
    }, []);
  
    return <pre>{JSON.stringify(data, null, 2)}</pre>;
  }

export default function SampleAPI() {
    return (
        <Page tabName="API Test">
            <Suspense fallback={<div>Loading api data...</div>}>
                <SampleAPIRequest/>
            </Suspense>
        </Page>
    )
}