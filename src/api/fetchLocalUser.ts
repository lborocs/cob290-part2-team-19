import { useEffect, useState } from 'react';

export default function fetchLocalUser() {
    const [loggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        const user = localStorage.getItem('loggedInUser');
        if (user) {
            setLoggedInUser(JSON.parse(user));
        }
    }, []);

    return loggedInUser;
}