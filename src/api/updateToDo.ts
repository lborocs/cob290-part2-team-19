const BASE_URL = "http://35.240.24.117:3300" // Change if hosted elsewhere


export async function updateToDoStatus(to_do_id: number, employee_id: number, completed: number | null, deleted: number | null): Promise<{ success: boolean; message: string }> {
    try {
        const payload: any = { to_do_id, employee_id };
        if (completed !== null) payload.completed = completed;
        if (deleted !== null) payload.deleted = deleted;

        const response = await fetch(`${BASE_URL}/update_todo_status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            const result = await response.json();
            return { success: true, message: result.message };
        } else {
            const error = await response.json();
            return { success: false, message: error.error };
        }
    } catch (error) {
        console.error('Error updating To-Do status:', error);
        return { success: false, message: 'An unexpected error occurred. Please try again later.' };
    }
}