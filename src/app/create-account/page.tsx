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

    useEffect(() => {
        const fetchHtmlContent = async () => {
            const response = await fetch('/create-account.html');
            const text = await response.text();
            setHtmlContent(text);

            const scriptContent = `
            const form = document.querySelector('form');
            if (form) {
                form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const formData = new FormData(event.target);
                const data = {
                    email: formData.get('email'),
                    password: formData.get('password'),
                    confirm_password: formData.get('confirm_password'),
                    first_name: formData.get('first_name'),
                    second_name: formData.get('second_name')
                };

                try {
                    const response = await fetch('http://localhost:3300/add_user', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                        });
                    }

                    if (response.ok) {
                        alert('Account created successfully!');
                    } else {
                        alert('Failed to create account.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('An error occurred while creating the account.');
                }
            });
            `;
            const scriptElement = document.createElement('script');
            scriptElement.innerHTML = scriptContent;
            document.body.appendChild(scriptElement);
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