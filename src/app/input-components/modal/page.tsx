"use client"
import { TextButton } from "@/app/components/Input/Buttons";
import { Modal } from "@/app/components/Input/Modals";
import Layout from "@/app/layout/page";
import { useState } from "react";

export default function ModalPage() {
    const [modalHidden, setModalHidden] = useState(true);

    return (
        <Layout tabName="Button Preview">
            <p className="mb-4">
                <a className="text-blue-600 underline" href="/input-components">
                    <i className="fa-solid fa-caret-left"></i>
                    Back
                </a>
            </p>

            <hr className="mt-4 mb-4" />

            <h1 className='text-xl font-bold mb-4'>Modals</h1>
            <TextButton
                icon={<i className="fa-solid fa-envelope-open mr-2"></i>}
                callback={()=>{setModalHidden(!modalHidden)}}>
                    Open Modal
            </TextButton>
            <Modal getHidden={()=>modalHidden} setHidden={(h)=>setModalHidden(h)}></Modal>
            
        </Layout>
    )
}