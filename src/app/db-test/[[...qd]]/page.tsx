"use client"
import { useRouter } from 'next/navigation';
import "./style.css"; 


async function DB_Test ({params}: {params:Promise<{qd:Array<string>}>}) {
    const router = useRouter();
    const query = (await params).qd;
    let msg;
    console.log(query);
    if (query === null || query === undefined) {
        msg = <div className='cardIt'>No query supplied</div>
    } else if (query[0]=="dev") {
        msg = <div className='cardIt'> Dev Server: Active</div>
    } else {
        msg = <div className='cardIt'>Query: '{query}'</div>
    }
    return <div className="centreIt">{msg}</div>
}
export default DB_Test;