import { useEffect, useState } from "react";
import { IconButton } from "./input/(Buttons)";

interface ModalProps {
    children? : React.ReactNode;
    header? : string;
    icon? : React.ReactNode;
    hidden? : boolean;
    getHidden : ()=>boolean;
    setHidden : (hidden:boolean)=>void;
}
export const Modal = ({
    children=<p>No content</p>,
    hidden=true,
    header="Modal Header",
    icon=<i className="fa-solid fa-circle-question mr-2"></i>,
    getHidden,
    setHidden
} : ModalProps) => {
    // useEffect(()=>{
    //     hidden = (getHidden() ?? hidden);
    // },[getHidden()]);
    return (
        <div style={{ display: getHidden() ? 'none' : 'initial' }} className="absolute top-0 left-0 overflow-hidden w-full h-full">
                <div className="bg-[#01010125] hover:bg-[#01010166] transition-colors ease-in-out
                                absolute top-[4em] left-[15em] z-1 
                                w-[calc(100vw-15em)] h-[calc(100vh-4em)] 
                                flex items-center justify-center">
                    <div className="bg-white rounded p-4 mr-[4em]">
                        <div className="flex items-center justify-between gap-28 ">
                            <h1 className="text-2xl font-bold">
                                {icon}{header}
                            </h1>
                            <IconButton 
                                icon={<i className="fa-solid fa-xmark"></i>}
                                color="bg-[rgba(0,0,0,0)]"
                                hoverColor="hover:bg-gray-200"
                                textColor="text-black"
                                width="w-12"
                                height="h-12"
                                style={{fontSize: "1.5em"}}
                                callback={()=>{setHidden(true)}}
                            />
                        </div>
                        <div className="m-2">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
    )
}