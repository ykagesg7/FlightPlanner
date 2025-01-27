import React from 'react';
import { FlightPlan, Waypoint } from '../types';
import WaypointList from './WaypointList';
import AirportSelect from './AirportSelect';
import NavaidSelector from './NavaidSelector';
import WaypointForm from './WaypointForm';

/**
 * Route Planning コンポーネント
 * 出発/到着空港の選択、NAVAIDの追加、ウェイポイントリストの表示を行う
 */
interface RoutePlanningProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
  airportOptions: any[];
  navaidOptions: any[];
  selectedNavaid: any;
  setSelectedNavaid: React.Dispatch<React.SetStateAction<any>>;
}

const RoutePlanning: React.FC<RoutePlanningProps> = ({
  flightPlan,
  setFlightPlan,
  airportOptions,
  navaidOptions,
  selectedNavaid,
  setSelectedNavaid,
}) => {
  
  // 新規: Waypointを追加する関数を定義
  const handleAddWaypoint = (waypoint: Waypoint) => {
    setFlightPlan({ ...flightPlan, waypoints: [...flightPlan.waypoints, waypoint] });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
      <h2 className="text-lg font-semibold mb-4">Route Planning</h2>
      
      {/* 出発空港選択 */}
      <AirportSelect
        label="Departure Airport"
        options={airportOptions}
        selectedOption={flightPlan.departure}
        onChange={(option) => setFlightPlan({ ...flightPlan, departure: option || null })}
        placeholder="Select Departure Airport"
      />

      {/* 到着空港選択 */}
      <AirportSelect
        label="Arrival Airport"
        options={airportOptions}
        selectedOption={flightPlan.arrival}
        onChange={(option) => setFlightPlan({ ...flightPlan, arrival: option || null })}
        placeholder="Select Arrival Airport"
      />

      {/* NAVAID選択と追加 */}
      <NavaidSelector
        options={navaidOptions}
        selectedNavaid={selectedNavaid}
        setSelectedNavaid={setSelectedNavaid}
        onAdd={handleAddWaypoint}
      />

      {/* ウェイポイント追加フォーム */}
      <WaypointForm
        flightPlan={flightPlan}
        setFlightPlan={setFlightPlan}
      />

      {/* ウェイポイントリスト */}
      <WaypointList flightPlan={flightPlan} setFlightPlan={setFlightPlan} />
    </div>
  );
};

export default RoutePlanning; 