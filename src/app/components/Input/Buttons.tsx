import React from "react";

interface IconButtonProps {
    icon? : React.ReactNode;
    width? : string;
    height? : string;
    style? : object;
    callback?: (e:any) => void;
    color? : string;
    hoverColor? : string;
    textColor? : string;
    children? : React.ReactNode;
}
export const IconButton = ({
    icon=<i className="fa-solid fa-arrow-up-right-from-square"/>,
    width="w-8",
    height="h-8",
    color="bg-gray-200",
    hoverColor="hover:bg-gray-300",
    textColor="text-blue-500",
    style={},
    callback=()=>{},
    children=null
} : IconButtonProps) => {
    return (
        <button className={width + " " + height + " " + color + " "+hoverColor + " " + textColor + " transition-colors ease-in-out font-bold rounded-full"} 
                style={style} 
                onClick={(e)=>{callback(e)}}>
            {icon}{children ?? ""}
        </button>   
    )
}

interface TextButtonProps {
    children? : any;
    style? : object;
    icon? : React.ReactNode;
    color? : string;
    hoverColor?: string;
    textColor? : string;
    callback? : ()=>void;
}

export const TextButton = ({
    children="Text Button",
    textColor="text-black",
    color="bg-gray-200",
    hoverColor="hover:bg-gray-300",
    icon=<i className="fa-regular fa-circle-dot mr-2"></i>,
    style={},
    callback=()=>{}
} : TextButtonProps) => {
    return (
        <button className={textColor+" "+color+" "+hoverColor+" text-center transition ease-in-out font-bold py-2 px-4 rounded"}
                onClick={callback} style={style}>
            {icon}{children}
        </button>
    )
}

