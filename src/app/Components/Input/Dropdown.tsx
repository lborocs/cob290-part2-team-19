import { useState } from "react";

interface DropdownProps {
    options: string[];
    selected?: string;
    selectedCallback?: (s: string) => void;
    width?: string;
    height?: string;
}
export const DropdownSelect = ({
    options,
    selected,
    selectedCallback=(e)=>{console.log(e)},
    width="20em",
    height="auto",
}: DropdownProps) => {
    const [sel, setSelected] = useState(selected);
    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelected(e.target.value);
        selectedCallback(e.target.value);
    };

    return (
        <select
            className="bg-gray-200 text-gray-700 py-2 px-2 rounded"
            value={sel}
            onChange={handleSelect}
            style={{width: width, height: height}}
        >
            {options.map((option, i) => (
                <option key={i} value={option}>{option}</option>
            ))}
        </select>
    );
}