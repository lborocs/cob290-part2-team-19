"use client"
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Login = () => {
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

            const scriptContent = `
            function validateUser() {
                const emailElement = document.getElementById('email');
                const email = emailElement ? emailElement.value : '';
                const passwordElement = document.getElementById('password');
                const password = passwordElement ? passwordElement.value : '';
                
                fetch('http://localhost:3300/login', {
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

            // Add event listener for the signIn button
            document.querySelector('.signInBtn')?.addEventListener('click', () => {
                validateUser();
            });`

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
        <div>

            <div dangerouslySetInnerHTML={{ __html: htmlContent }} className="text-black">
            </div>
                <div>
                    <div className="absolute top-[1em] right-[1em]">
                        <div className="flex gap-[.3em] justify-start items-center">
                            <i className="fa-solid fa-code w-[1em]"></i>
                            <span>Development Mode</span>
                        </div>
                    </div>
                    <div className="absolute top-[1em] left-[1em]">
                        <div className="flex gap-[.3em] justify-start items-center">
                            <i className="fa-solid fa-table-columns w-[1em]"></i>
                            <button className="" onClick={() => router.push("/dashboard")}>Dev: Dashboard</button>
                        </div>
                        
                        <div className="flex gap-[.3em] justify-start items-center">
                            <i className="fa-solid fa-database w-[1em]"></i>
                            <button className="" onClick={() => router.push("/db-test")}>Dev: Database Test</button>
                        </div>

                        <div className="flex gap-[.3em] justify-start items-center">
                            <i className="fa-solid fa-computer-mouse w-[1em]"></i> 
                            <button className="" onClick={() => router.push("/input-components")}>Dev: Input Previews</button>
                        </div>
                    </div>
                </div>
        </div>
        </body>
        </html>
    );

    // useEffect(() => {
    //     const link = document.createElement('link');
    //     link.href = 'https://fonts.googleapis.com/css2?family=Afacad+Flux&display=swap';
    //     link.rel = 'stylesheet';
    //     document.head.appendChild(link);
    //     return () => {
    //         document.head.removeChild(link);
    //     };
    // }, []);
    // return (
    // <div id="bd" className="text-black select-none margin-0 padding-0 bg-[#f0f0f0]" style={{width: "100vw", height: "100vh", fontFamily: "Afacad Flux"}}>
    //     <main className="flex width-[100%] height-[100%] justify-center items-center">
    //         <div id="panel" className="bg-white flex justify-center items-center flex-col" style={{boxShadow : "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;"}}>
    //             <div id="intro" className="flex flex-col-reverse justify-center items-center gap-[7px] margin-top-[10px]">
    //                 <div id="introText">
    //                     <h1 className="text-3xl text-center font-bold margin-0">Welcome back</h1>
    //                     <sub className="text-base text-center text-gray-400">Please enter your details to sign in.</sub>
    //                 </div>
    //                 <div id="introLogo" className="width-[70px] height-[70px] border-2 border-solid border-gray-200 rounded-full bg-color-[#f0f0f0]" style={{boxShadow:"inset rgba(75, 75, 73, 0.2) 0px 7px 29px 0px,rgba(75, 75, 73, 0.2) 0px 7px 29px 0px"}}></div>
    //                     <img id="logo" width="40px" height="40px" src="/squarelogo.png" alt="logo" className="width-[40px] height-[40px] relative top-[15px] left-[15px]"></img>
    //                 </div>
    //             </div>
    //             <div id="form">
    //             <form action="" method="post">
    //                 <div className="formGroup">
    //                     <div className="textInput">
    //                         <label htmlFor="email" className="">Email</label>
    //                         <input id="email" type="email" required placeholder="Your email"/>
    //                     </div>
    //                     <div className="textInput">
    //                         <label htmlFor="password">Password</label>
    //                         <input type="password" id="password" name="password" required placeholder="Your password"/>
    //                     </div>
    //                 </div>
    //                 <div id="rememberForgot">
    //                     <div id="rememberMe">
    //                         <input type="checkbox" id="remember" name="remember" />
    //                         <label htmlFor="remember">Remember me</label>
    //                     </div>
    //                     <div id="forgotPass">
    //                         <a href="#">Forgot password?</a>
    //                     </div>
    //                 </div>
    //                 <div className="formGroup">
    //                     <button type="submit">Sign In</button>
    //                     <div className="signInSignUpSep">
    //                         <hr className="formPreHr" />
    //                         <span className="spanMidHrCont">or</span>
    //                         <hr className="formPostHr" />
    //                     </div>
    //                 </div>
    //                 <div className="formGroup">
    //                     <span>Don't have an account yet?</span>
    //                     <a href="#">Sign Up</a>
    //                 </div>
    //             </form>
    //             </div>
    //     </main>
    //     <aside>
    //         <img src="/logo.png" alt="logo" aria-hidden="true" />
    //     </aside>
    // </div>
    // );
       
}
export default Login