"use client"
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Login = () => {
    const [htmlContent, setHtmlContent] = useState('');

    useEffect(() => {
        const fetchHtmlContent = async () => {
            const response = await fetch('/login.html');
            const text = await response.text();
            setHtmlContent(text);
        };

        fetchHtmlContent();
    }, []);

    return (
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
}
export default Login