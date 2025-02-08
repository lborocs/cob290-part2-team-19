import Head from "next/head";
import Link from "next/link";

export default function NotFound() {
    return (
    <>
        <Head key="a"><title>404 Not Found</title></Head>
        <div className="custom404 rounded-xl
            w-[99%] h-[100%] mt-[0.3em] ml-[0.3em] 
            flex justify-center items-center
             ">
            <div className="flex justify-center items-center flex-col relative w-fit h-fit left-[-2em] top-[-5em]">
                <h1 className="text-3xl font-bold">404</h1>
                <p className="mb-4">Sorry, we couldn't find that page!</p>
                <p className="font-semibold text-xl"> {"->"} <Link href="/" className="underline">Return to safety</Link> {"<-"} </p>
            </div>
        </div>
    </>
    )
}