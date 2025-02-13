import React from 'react';
import FullCalendar from "@fullcalendar/react";
import { DateSelectArg } from '@fullcalendar/common';
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import Card from '../components/Card';

interface FullscreenModalProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({ isFullscreen, toggleFullscreen }) => {
  if (!isFullscreen) return null;

  return (
    <div className="h-full p-4 ps-0 pb-0">
      <Card className="w-full h-full ">
        <div className="flex justify-between items-center title">
          <div></div>
          <button onClick={toggleFullscreen} className="pe-2 rounded flex items-center">
            <i className="fa-solid fa-arrow-left mr-2"></i>
            <span>Back</span>
          </button>
        </div>

        <hr className="border-gray-300 my-2" />


        {isFullscreen ? (
          <>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              dateClick={handleDateClick}
              height="auto"
            />
            {selectedDate && (
              <div className="mt-4 p-4 border rounded shadow bg-white">
                <h3 className="text-lg font-semibold">
                  Tasks Due on {selectedDate}
                </h3>
                {selectedDateTasks.length > 0 ? (
                  <ul>
                    {selectedDateTasks.map((task) => (
                      <li key={task.task_id} className="p-2 border-b">
                        <strong>{task.task_name}</strong> - {task.description}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No tasks due on this date.</p>
                )}
              </div>
            )}
          </>
        )
      </Card>
    </div >
  );
};

export default FullscreenModal;