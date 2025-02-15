
export async function addToDo(employee_id: number, description: string, task_id: number): Promise<{ success: boolean; message: string }> {
    try {
        const response = await fetch('http://localhost:3300/new_todo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                employee_id,
                description,
                task_id,
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
        console.error('Error creating new to-do:', error);
        return { success: false, message: 'An unexpected error occurred. Please try again later.' };
    }
}