import { BASE_URL } from "./globals";// Change if hosted elsewhere

export async function fetchUserType(user_id: number): Promise<{ success: boolean; userType?: number; message?: string }> {
    try {
        const response = await fetch(`${BASE_URL}/get_user_type/${user_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const result = await response.json();
            return { success: true, userType: result.userType };
        } else {
            const error = await response.json();
            return { success: false, message: error.error };
        }
    } catch (error) {
        console.error('Error fetching user type:', error);
        return { success: false, message: 'An unexpected error occurred. Please try again later.' };
    }
}