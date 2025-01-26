import React from 'react';
import { FlightPlan, Waypoint } from '../types';
import ReactSelect from 'react-select';
import WaypointList from '../components/WaypointList';

interface RoutePlanningProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
  airportOptions: any[];
  navaidOptions: any[];
  selectedNavaid: any;
  setSelectedNavaid: React.Dispatch<React.SetStateAction<any>>;
}

/**
 * Route Planning コンポーネント
 * 出発/到着空港の選択、NAVAIDの追加、ウェイポイントリストの表示を行う
 */
const RoutePlanning: React.FC<RoutePlanningProps> = ({
  flightPlan,
  setFlightPlan,
  airportOptions,
  navaidOptions,
  selectedNavaid,
  setSelectedNavaid,
}) => {
  // 出発空港変更時のハンドラー
  const handleDepartureAirportChange = (selectedOption: any) => {
    setFlightPlan({ ...flightPlan, departure: selectedOption || null });
  };

  // 到着空港変更時のハンドラー
  const handleArrivalAirportChange = (selectedOption: any) => {
    setFlightPlan({ ...flightPlan, arrival: selectedOption || null });
  };

  // NAVAID追加ボタンクリック時のハンドラー
  const handleAddNavaid = () => {
    if (selectedNavaid) {
      // selectedNavaid.label から名前部分のみを抽出 (例: "銚子 (CVT)" -> "銚子")
      const navaidName = selectedNavaid.label.split(' ')[0]; // スペースで分割して最初の要素を取得

      const navaid: Waypoint = {
        id: selectedNavaid.value,
        // 修正: waypoint.name に抽出した名前を設定
        name: navaidName,
        type: selectedNavaid.type,
        coordinates: selectedNavaid.coordinates,
        ch: selectedNavaid.ch,
        latitude: selectedNavaid.latitude,
        longitude: selectedNavaid.longitude,
      };
      setFlightPlan({ ...flightPlan, waypoints: [...flightPlan.waypoints, navaid] });
      setSelectedNavaid(null); // 選択中のNAVAIDをクリア
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
      <h2 className="text-lg font-semibold mb-4">Route Planning</h2>
      <div className="mb-4">
        <label htmlFor="departure" className="block text-sm font-medium text-gray-700 mb-2">Departure Airport</label>
        <ReactSelect
          id="departure"
          options={airportOptions}
          value={flightPlan.departure}
          onChange={handleDepartureAirportChange}
          placeholder="Select Departure Airport"
          isClearable
          styles={{
            control: (provided) => ({
              ...provided,
              borderRadius: '0.5rem',
              borderColor: '#e5e7eb',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              '&:hover': {
                borderColor: '#d1d5db',
              },
            }),
          }}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="arrival" className="block text-sm font-medium text-gray-700 mb-2">Arrival Airport</label>
        <ReactSelect
          id="arrival"
          options={airportOptions}
          value={flightPlan.arrival}
          onChange={handleArrivalAirportChange}
          placeholder="Select Arrival Airport"
          isClearable
          styles={{
            control: (provided) => ({
              ...provided,
              borderRadius: '0.5rem',
              borderColor: '#e5e7eb',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              '&:hover': {
                borderColor: '#d1d5db',
              },
            }),
          }}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="navaid" className="block text-sm font-medium text-gray-700 mb-2">Add NAVAID</label>
        <ReactSelect
          id="navaid"
          options={navaidOptions}
          value={selectedNavaid}
          onChange={(selectedOption) => setSelectedNavaid(selectedOption)}
          placeholder="Select NAVAID"
          isClearable
          styles={{
            control: (provided) => ({
              ...provided,
              borderRadius: '0.5rem',
              borderColor: '#e5e7eb',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              '&:hover': {
                borderColor: '#d1d5db',
              },
            }),
          }}
        />
        <button
          onClick={handleAddNavaid}
          className="mt-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add NAVAID to Route
        </button>
      </div>

      {/* WaypointList コンポーネントを配置 */}
      <WaypointList flightPlan={flightPlan} setFlightPlan={setFlightPlan} />
    </div>
  );
};

export default RoutePlanning; 