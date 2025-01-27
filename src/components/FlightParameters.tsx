import React from 'react';
import { FlightPlan } from '../types';
import { calculateTAS, calculateMach, formatTime } from '../utils';
import { ChevronUp, ChevronDown, Clock, Gauge, BarChart } from 'lucide-react';

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

  // 日付と時刻のローカルステート
  const [localDate, setLocalDate] = React.useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // JSTからUTCへの変換関数を追加
  const convertJSTToUTC = (dateStr: string, timeStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // JSTはUTC+9時間なので9時間引く
    const date = new Date(Date.UTC(year, month - 1, day, hours - 9, minutes));
    
    // 日付をまたぐ場合の処理
    if (date.getUTCHours() < 0) {
      date.setUTCDate(date.getUTCDate() - 1);
      date.setUTCHours(date.getUTCHours() + 24);
    }
    
    return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')} UTC`;
  };

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

  // 出発時刻変更ハンドラー
  const handleDepartureTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    const [hours, minutes] = time.split(':').map(Number);
    const newTime = formatTime(hours * 60 + minutes);
    setFlightPlan(prev => ({
      ...prev,
      departureTime: newTime
    }));
  };

  // 日付変更ハンドラー
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalDate(e.target.value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <BarChart className="w-5 h-5 mr-2" /> Flight Parameters
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 日時設定セクション */}
        <fieldset className="p-4 border rounded-lg">
          <legend className="text-md font-semibold mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-1" /> Date & Time
          </legend>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={localDate}
              onChange={handleDateChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Departure Time (JST)</label>
            <input
              type="time"
              value={flightPlan.departureTime || ''}
              onChange={handleDepartureTimeChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              step="300" // 5分刻み
            />
            {flightPlan.departureTime && (
              <p className="mt-1 text-sm text-gray-500">
                {convertJSTToUTC(localDate, flightPlan.departureTime)}
              </p>
            )}
          </div>
        </fieldset>

        {/* 速度設定セクション */}
        <fieldset className="p-4 border rounded-lg">
          <legend className="text-md font-semibold mb-2 flex items-center">
            <Gauge className="w-4 h-4 mr-1" /> Speed
          </legend>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Speed (knots)</label>
            <div className="mt-1 flex rounded-md shadow-sm items-center">
              <button
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-r-md focus:outline-none"
                onClick={() => handleSpeedChange(flightPlan.speed - 10)}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <input
                type="number"
                value={flightPlan.speed}
                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                className="w-full px-2 py-1 text-center border-t border-b border-gray-300 focus:outline-none"
              />
              
              <button
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-l-md focus:outline-none"
                onClick={() => handleSpeedChange(flightPlan.speed + 10)}
              >
                <ChevronUp className="w-4 h-4" />
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
        </fieldset>

        {/* 高度設定セクション */}
        <fieldset className="p-4 border rounded-lg">
          <legend className="text-md font-semibold mb-2 flex items-center">
            <BarChart className="w-4 h-4 mr-1" /> Altitude
          </legend>
          <div>
            <label className="block text-sm font-medium text-gray-700">Altitude (feet)</label>
            <div className="mt-1 flex rounded-md shadow-sm items-center">
              
              <button
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-r-md focus:outline-none"
                onClick={() => handleAltitudeChange(flightPlan.altitude - 1000)}
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              <input
                type="number"
                value={flightPlan.altitude}
                onChange={(e) => handleAltitudeChange(Number(e.target.value))}
                className="w-full px-2 py-1 text-center border-t border-b border-gray-300 focus:outline-none"
              />

              <button
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-l-md focus:outline-none"
                onClick={() => handleAltitudeChange(flightPlan.altitude + 1000)}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default FlightParameters; 