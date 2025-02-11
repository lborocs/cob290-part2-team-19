"use client"
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const CreateAccount = () => {
    const [htmlContent, setHtmlContent] = useState('');

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://kit.fontawesome.com/c8b5e2a200.js';
        script.crossOrigin = 'anonymous';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/create-account.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    
    useEffect(() => {
        const fetchHtmlContent = async () => {
            const response = await fetch('/create-account.html');
            const text = await response.text();
            setHtmlContent(text);
        };

        fetchHtmlContent();
    }, []);

    return (
        <html>
        <head>
            <title>Login - Make-It-All</title>
        </head>
        <body>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} className="text-black">
            </div>
        </body>
        </html>
    );
}
export default CreateAccount;