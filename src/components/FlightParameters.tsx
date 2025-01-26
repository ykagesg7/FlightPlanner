import React from 'react';
import { FlightPlan } from '../types';
import { calculateTAS, calculateMach } from '../utils';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface FlightParametersProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
}

/**
 * Flight Parameters コンポーネント
 * 速度、高度の入力とTAS、Machの表示を行う
 */
const FlightParameters: React.FC<FlightParametersProps> = ({
  flightPlan,
  setFlightPlan,
}) => {
  // localTas, localMach は FlightParameters.tsx 内部で初期化するように修正
  const [localTas, setLocalTas] = React.useState<number | undefined>(flightPlan.tas); // 初期値を props の flightPlan.tas から取得
  const [localMach, setLocalMach] = React.useState<number | undefined>(flightPlan.mach); // 初期値を props の flightPlan.mach から取得

  // 速度変更時のハンドラー
  const handleSpeedChange = (speed: number) => {
    // TASとMachを再計算
    const tas = calculateTAS(speed, flightPlan.altitude);
    const mach = calculateMach(tas, flightPlan.altitude);
    // FlightPlanステートを更新
    setFlightPlan({ ...flightPlan, speed, tas, mach });
    // ローカルのTASとMachステートも更新 (初期表示用)
    setLocalTas(tas);
    setLocalMach(mach);
  };

  // 高度変更時のハンドラー
  const handleAltitudeChange = (altitude: number) => {
    // TASとMachを再計算
    const tas = calculateTAS(flightPlan.speed, altitude);
    const mach = calculateMach(tas, flightPlan.altitude);
    // FlightPlanステートを更新
    setFlightPlan({ ...flightPlan, altitude, tas, mach });
    // ローカルのTASとMachステートも更新 (初期表示用)
    setLocalTas(tas);
    setLocalMach(mach);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Flight Parameters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Speed (knots)</label>
          <div className="mt-1 flex rounded-md shadow-sm items-center">
            <button
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-l-md focus:outline-none"
              onClick={() => handleSpeedChange(flightPlan.speed - 10)}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <input
              type="number"
              value={flightPlan.speed}
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              className="w-full px-2 py-1 text-center border-t border-b border-gray-300 focus:outline-none"
            />
            <button
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-r-md focus:outline-none"
              onClick={() => handleSpeedChange(flightPlan.speed + 10)}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          {localTas && (
            <p className="mt-1 text-sm text-gray-500">
              TAS: {Math.round(localTas)} knots
            </p>
          )}
          {localMach && (
            <p className="text-sm text-gray-500">
              Mach: {localMach.toFixed(3)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Altitude (feet)</label>
          <div className="mt-1 flex rounded-md shadow-sm items-center">
            <button
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-l-md focus:outline-none"
              onClick={() => handleAltitudeChange(flightPlan.altitude - 1000)}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <input
              type="number"
              value={flightPlan.altitude}
              onChange={(e) => handleAltitudeChange(Number(e.target.value))}
              className="w-full px-2 py-1 text-center border-t border-b border-gray-300 focus:outline-none"
            />
            <button
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-r-md focus:outline-none"
              onClick={() => handleAltitudeChange(flightPlan.altitude + 1000)}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightParameters; 