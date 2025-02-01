import { useEffect, useState } from "react";
import { SimpleSearchBox } from "./Text";

interface DropdownProps {
    options: string[];
    selected?: string;
    selectedCallback?: (s: string) => void;
    width?: string;
    height?: string;
    style?: any;
    bindValue?: ()=>string | undefined;
}
export const DropdownSelect = ({
    options,
    selected="",
    selectedCallback=(e)=>{console.log(e)},
    width="15em",
    height="auto",
    style={},
    bindValue=()=>undefined,
}: DropdownProps) => {
    // if selected is not in options, don't set it as selected
    const [sel, setSelected] = useState(selected);

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelected(e.target.value);
        selectedCallback(e.target.value);
    };

    useEffect(() => {
        setSelected(bindValue() ?? sel);
    },[bindValue()]);

    return (
        <select
            className="bg-gray-200 text-gray-700 py-2 px-2 rounded"
            // value={sel}
            value={sel}
            onChange={handleSelect}
            style={{width: width, height: height, ...style}}
        >
            {options.map((option, i) => (
                <option key={i} value={option}>{option}</option>
            ))}
        </select>
    );
}

interface SearchableDropdownProps {
    options: string[];
    selected?: string;
    selectedCallback?: (s: string) => void;
    inputChangeCallback?: (s: string) => void;
    width?: string;
    height?: string;
    dropdownStyle?: any;
    inputStyle?: any;
}
export const SearchableDropdownSelect = ({
    options,
    inputChangeCallback=(q)=>{},
    selectedCallback=(e)=>{console.log(e)},
    width="15em",
    height="auto",
    dropdownStyle={},
    inputStyle={},
} : SearchableDropdownProps) => {
    const [q, setQ] = useState("");
    const dStyle = {
        borderTopLeftRadius:"0px", borderTopRightRadius: "0px",
        backgroundColor: "#4a6283", color:"white",
        ...dropdownStyle
    };
    const iStyle = {borderBottomLeftRadius:"0px",borderBottomRightRadius: "0px", ...inputStyle};

    const modifiedInputChangeCallback = (q: string) => {
        // make q lowercase, and compare against lowercase options
        // modify copies of params
        const qLower = q.toLowerCase();
        const optionsLower = options.map((o)=>o.toLowerCase());
        // if qLower is in optionsLower, set it as selected
        if (optionsLower.includes(qLower)) {
            selectedCallback(options[optionsLower.indexOf(qLower)]);
        }
    }

    return (
        <div className="inline-flex flex-col">
            <SimpleSearchBox 
                width={width}
                height={height}
                style={iStyle}
                inputChangeCallback={(q)=>{setQ(q); inputChangeCallback(q); modifiedInputChangeCallback(q)}}
            />
            <DropdownSelect 
                options={options} 
                selectedCallback={selectedCallback}
                width={width}
                height={height}
                style={dStyle}
                bindValue={()=>q}
            />
        </div>
    )
}