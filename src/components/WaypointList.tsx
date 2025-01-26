import React from 'react';
import { FlightPlan } from '../types';
import { MapPin, ChevronUp, ChevronDown } from 'lucide-react';
import { formatDMS } from '../utils';

interface WaypointListProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
}

/**
 * Waypoint List コンポーネント
 * ウェイポイントのリスト表示と操作（移動、削除、名前編集）を行う
 */
const WaypointList: React.FC<WaypointListProps> = ({ flightPlan, setFlightPlan }) => {
  // 編集中のウェイポイントのstateを追加
  const [editingWaypointIndex, setEditingWaypointIndex] = React.useState< number | null>(null);
  // 編集中のウェイポイント名のstateを追加
  const [editingWaypointName, setEditingWaypointName] = React.useState<string>('');

  // ウェイポイントを上に移動するハンドラー
  const handleMoveWaypointUp = (index: number) => {
    if (index > 0) {
      const updatedWaypoints = [...flightPlan.waypoints];
      const temp = updatedWaypoints[index];
      updatedWaypoints[index] = updatedWaypoints[index - 1];
      updatedWaypoints[index - 1] = temp;
      setFlightPlan({ ...flightPlan, waypoints: updatedWaypoints });
    }
  };

  // ウェイポイントを下に移動するハンドラー
  const handleMoveWaypointDown = (index: number) => {
    if (index < flightPlan.waypoints.length - 1) {
      const updatedWaypoints = [...flightPlan.waypoints];
      const temp = updatedWaypoints[index];
      updatedWaypoints[index] = updatedWaypoints[index + 1];
      updatedWaypoints[index + 1] = temp;
      setFlightPlan({ ...flightPlan, waypoints: updatedWaypoints });
    }
  };

  // ウェイポイントを削除するハンドラー
  const handleRemoveWaypoint = (index: number) => {
    const updatedWaypoints = flightPlan.waypoints.filter((_, i) => i !== index);
    setFlightPlan({ ...flightPlan, waypoints: updatedWaypoints });
  };

  // ウェイポイント名の編集開始ハンドラー
  const handleEditWaypointName = (index: number, currentName: string) => {
    setEditingWaypointIndex(index);
    setEditingWaypointName(currentName);
  };

  // ウェイポイント名編集の変更ハンドラー
  const handleWaypointNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingWaypointName(e.target.value);
  };

  // ウェイポイント名編集の完了ハンドラー
  const handleSaveWaypointName = (index: number) => {
    const updatedWaypoints = [...flightPlan.waypoints];
    updatedWaypoints[index].name = editingWaypointName;
    setFlightPlan({ ...flightPlan, waypoints: updatedWaypoints });
    setEditingWaypointIndex(null);
  };

  // ウェイポイント名編集のキャンセルハンドラー
  const handleCancelEditWaypointName = () => {
    setEditingWaypointIndex(null);
  };

  return (
    <>
      {flightPlan.waypoints.length > 0 && (
        <div className="mt-8">
          <h3 className="text-md font-semibold mb-2">Waypoints</h3>
          <ul>
            {flightPlan.waypoints.map((waypoint, index) => (
              <li key={index} className="p-2 rounded hover:bg-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {/* ウェイポイント名表示 */}
                    {editingWaypointIndex === index ? (
                      <input
                        type="text"
                        value={editingWaypointName}
                        onChange={handleWaypointNameChange}
                        onBlur={() => handleSaveWaypointName(index)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveWaypointName(index);
                          } else if (e.key === 'Escape') {
                            handleCancelEditWaypointName();
                          }
                        }}
                        className="border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => handleEditWaypointName(index, waypoint.name)}
                        className="hover:underline text-left"
                      >
                        {waypoint.name}
                      </button>
                    )}
                    ({waypoint.id})
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleMoveWaypointUp(index)}
                      className="p-1 rounded-full hover:bg-gray-200"
                      aria-label="Move Waypoint Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveWaypointDown(index)}
                      className="p-1 rounded-full hover:bg-gray-200"
                      aria-label="Move Waypoint Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveWaypoint(index)}
                      className="p-1 rounded-full hover:bg-red-200 text-red-500"
                      aria-label="Remove Waypoint"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-4.5 5.25a.75.75 0 0 0-1.06 1.06L10.94 12 6.44 16.5a.75.75 0 1 0 1.06 1.06L12 13.06l4.5 4.5a.75.75 0 1 0 1.06-1.06L13.06 12l4.5-4.5a.75.75 0 0 0-1.06-1.06L12 10.94 7.5 6.44Z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* 詳細情報表示 */}
                <div className="text-sm text-gray-500 mt-1">
                  <div>ID: {waypoint.id}</div>
                  {waypoint.ch && <div>周波数: {waypoint.ch}</div>}
                  {waypoint.latitude && waypoint.longitude && (
                    <div>位置: {formatDMS(waypoint.latitude, waypoint.longitude)}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default WaypointList; 