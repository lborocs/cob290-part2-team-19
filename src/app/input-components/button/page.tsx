"use client"
import { IconButton, TextButton } from "@/app/(components)/Input/Buttons";
import Layout from "@/app/layout/page";

export default function ButtonPage() {
    return (
        <Layout tabName="Button Preview">
            <p className="mb-4">
                <a className="text-blue-600 underline" href="/input-components">
                    <i className="fa-solid fa-caret-left"></i>
                    Back
                </a>
            </p>

            <hr className="mt-4 mb-4" />

            <h1 className='text-xl font-bold'>Icon Buttons</h1>
            <div className="flex flex-col gap-4 mt-2">
                <div className="flex gap-2 items-center">
                    <IconButton></IconButton>
                    Default Icon Button
                </div>
                <div className="flex gap-2 items-center">
                    <IconButton icon={<i className="fa-solid fa-check"></i>}></IconButton>            
                    Custom Icon 
                </div>
                <div className="flex gap-2 items-center">
                    <IconButton color="bg-green-400" hoverColor="hover:bg-green-500" textColor="green-400"></IconButton>            
                    Custom Color+Hover Color 
                </div>
                <div className="flex gap-2 items-center">
                    <IconButton callback={()=>{alert("Icon Button Clicked")}}></IconButton>            
                    w/ Callback 
                </div>
            </div>

            <hr className="mt-4" />

            <h1 className='text-xl font-bold mt-4'>Normal Buttons</h1>
            <div className="flex flex-col gap-4 mt-2">
                <div className="flex gap-2 items-center">
                    Default Text Button 
                    <TextButton />            
                </div>

                <div className="flex gap-2 items-center">
                    Custom Icon 
                    <TextButton icon={<i className="fa-solid fa-play"></i>}/>            
                </div>

                <div className="flex gap-2 items-center">
                    Custom Icon+Text 
                    <TextButton icon={<i className="fa-solid fa-play"></i>}>Play</TextButton>            
                </div>

                
                <div className="flex gap-2 items-center">
                    Custom Colors 
                    <TextButton textColor="text-white" color="bg-[#1f2937]" hoverColor="hover:bg-[#4a6283]"/>            
                </div>

                <div className="flex gap-2 items-center">
                    With callback 
                    <TextButton callback={()=>{alert("Text Button clicked")}}/>            
                </div>
            </div>
        </Layout>
    )
}