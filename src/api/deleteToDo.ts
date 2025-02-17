const BASE_URL = "http://35.240.24.117:3300" // Change if hosted elsewhere
export async function deleteToDo(employee_id: number) {
    try {
        const response = await fetch(`${BASE_URL}/delete_todo?employee_id=${employee_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const result = await response.json();
            return { success: true, message: result.message };
        } else {
            const error = await response.json();
            return { success: false, message: error.error };
        }
    } catch (error) {
        console.error('Error deleting to-do:', error);
        return { success: false, message: 'An unexpected error occurred. Please try again later.' };
    }
}
