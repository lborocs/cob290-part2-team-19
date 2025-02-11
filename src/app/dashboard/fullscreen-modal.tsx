import React from 'react';
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

        {/* temp data replacve later */}
        <ul className="space-y-3 pe-2">
          <li className="flex items-center justify-between border p-2 rounded shadow-sm">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <div className="flex-1 ml-2">
              <div className="font-medium">Design Review</div>
              <div className="text-sm text-gray-500">Manager 1</div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <i className="fa-solid fa-calendar-alt mr-1"></i>
              <span>30/10/24</span>
            </div>
          </li>
          <li className="flex items-center justify-between border p-2 rounded shadow-sm">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <div className="flex-1 ml-2">
              <div className="font-medium">Team Meeting</div>
              <div className="text-sm text-gray-500">Manager 2</div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <i className="fa-solid fa-calendar-alt mr-1"></i>
              <span>31/10/24</span>
            </div>
          </li>
          <li className="flex items-center justify-between border p-2 rounded shadow-sm">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <div className="flex-1 ml-2">
              <div className="font-medium">Documentation</div>
              <div className="text-sm text-gray-500">Manager 1</div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <i className="fa-solid fa-calendar-alt mr-1"></i>
              <span>01/11/24</span>
            </div>
          </li>
        </ul>
      </Card>
    </div >
  );
};

export default FullscreenModal;