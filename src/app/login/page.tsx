"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Head from "next/head"
const BASE_URL = "http://localhost:3300"

const Login = () => {
    const [htmlContent, setHtmlContent] = useState("")
    const router = useRouter()

    // Load FontAwesome script dynamically
    useEffect(() => {
        const script = document.createElement("script")
        script.src = "https://kit.fontawesome.com/c8b5e2a200.js"
        script.crossOrigin = "anonymous"
        script.async = true
        document.body.appendChild(script)
        return () => {
            document.body.removeChild(script) // Clean up the script when the component unmounts
        }
    }, [])

    // Fetch and set HTML content
    useEffect(() => {
        const fetchHtmlContent = async () => {
            const response = await fetch("/login.html")
            const text = await response.text()
            setHtmlContent(text)

            const scriptContent = `
                function validateUser() {
                    const emailElement = document.getElementById('email');
                    const email = emailElement ? emailElement.value : '';
                    const passwordElement = document.getElementById('password');
                    const password = passwordElement ? passwordElement.value : '';

                    fetch('${BASE_URL}/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({email: email, password: password})
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Store user data in localStorage
                            localStorage.setItem('userData', JSON.stringify(data.user));
                            // Redirect to dashboard
                            window.location.href = '/dashboard';
                        } else {
                            const toastContent = document.getElementById('toast-content');
                            if (toastContent) {
                                toastContent.innerText = "Wrong email or password";
                            }
                            const alertToast = document.querySelector('.alert-toast');
                            if (alertToast) {
                                alertToast.style.opacity = '0';
                                let opacity = 0;
                                const fadeIn = setInterval(() => {
                                    if (opacity >= 1) {
                                        clearInterval(fadeIn);
                                    }
                                    alertToast.style.opacity = opacity;
                                    opacity += 0.1;
                                }, 10);
                                alertToast.style.display = 'block';
                            }
                        }
                    });
                }

                // Close toast function
                function closeToast() {
                    const alertToast = document.querySelector('.alert-toast');
                    if (alertToast) {
                        let opacity = 1;
                        const fadeOut = setInterval(() => {
                            if (opacity <= 0) {
                                clearInterval(fadeOut);
                            }
                            alertToast.style.opacity = opacity;
                            opacity -= 0.1;
                        }, 50);
                        alertToast.style.display = 'none';
                    }
                }

                document.querySelector('.signInBtn')?.addEventListener('click', () => {
                    validateUser();
                });
            `

            const scriptElement = document.createElement("script")
            scriptElement.innerHTML = scriptContent
            document.body.appendChild(scriptElement)
        }

        fetchHtmlContent()
    }, [])

    // const isDev = process.env.NODE_ENV === 'development';
    const isDev = false;
    const devContent = isDev ? <div>
        <div className='absolute top-[1em] right-[1em]'>
            <div className='flex gap-[.3em] justify-start items-center'>
                <i className='fa-solid fa-code w-[1em]'></i>
                <span>Development Mode: {isDev ? "Yes" : "No"}</span>
            </div>
        </div>
        <div className='absolute top-[1em] left-[1em]'>
            <div className='flex gap-[.3em] justify-start items-center'>
                <i className='fa-solid fa-table-columns w-[1em]'></i>
                <button className='' onClick={() => router.push("/dashboard")}>
                    Dev: Dashboard
                </button>
            </div>

            <div className='flex gap-[.3em] justify-start items-center'>
                <i className='fa-solid fa-database w-[1em]'></i>
                <button className='' onClick={() => router.push("/db-test")}>
                    Dev: Database Test
                </button>
            </div>

            <div className='flex gap-[.3em] justify-start items-center'>
                <i className='fa-solid fa-computer-mouse w-[1em]'></i>
                <button
                    className=''
                    onClick={() => router.push("/input-components")}
                >
                    Dev: Input Previews
                </button>
            </div>
        </div>
    </div> : "";


    return (
        <html>
            <head>
                <title>Login - Make-It-All</title>
            </head>
            <body>
                <div>
                    <div
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                        className='text-black'
                    ></div>
                    {devContent}
                </div>
            </body>
        </html>
    )
}

export default Login
