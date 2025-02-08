import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Login() {
    const [htmlContent, setHtmlContent] = useState('');
    const router = useRouter();
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
        const fetchHtmlContent = async () => {
            const response = await fetch('/login.html');
            const text = await response.text();
            setHtmlContent(text);
        };

        fetchHtmlContent();
    }, []);

    return (
        <div>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }}>
            </div>
        </div>
    );
}
