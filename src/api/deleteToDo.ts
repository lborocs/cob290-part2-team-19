export async function deleteToDo(employee_id: number) {
    try {
        const response = await fetch('http://localhost:3300/delete_todo', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                employee_id,
            }),
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