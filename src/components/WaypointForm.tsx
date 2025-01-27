import React, { useState } from 'react';
import DmsInput from './DmsInput';

interface WaypointFormProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
}

const WaypointForm: React.FC<WaypointFormProps> = ({ flightPlan, setFlightPlan }) => {
  const [bearing, setBearing] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  const [coordinateInputMode, setCoordinateInputMode] = useState<'DMS' | 'Decimal'>('DMS');
  const [dmsLatitude, setDmsLatitude] = useState<string>('');
  const [dmsLongitude, setDmsLongitude] = useState<string>('');
  const [decimalLatitude, setDecimalLatitude] = useState<string>('');
  const [decimalLongitude, setDecimalLongitude] = useState<string>('');

  // オフセットポイントの計算ロジックは既存の関数を利用

  // ウェイポイント追加ハンドラー
  const handleAddWaypoint = () => {
    // 既存のhandleAddDmsWaypointとhandleAddDecimalWaypointのロジックを統合
    // DMS入力かDecimal入力かに応じて処理を分岐
    if (coordinateInputMode === 'DMS') {
      if (dmsLatitude && dmsLongitude) {
        let latDecimal = dmsToDecimal(dmsLatitude, true);
        let lonDecimal = dmsToDecimal(dmsLongitude, false);

        if (latDecimal !== null && lonDecimal !== null) {
          let coordinates: [number, number] = [lonDecimal, latDecimal];

          if (bearing && distance) {
            const offset = calculateOffsetPoint(
              latDecimal,
              lonDecimal,
              parseFloat(bearing),
              parseFloat(distance)
            );
            if (offset) {
              coordinates = [offset.lon, offset.lat];
              latDecimal = offset.lat;
              lonDecimal = offset.lon;
            }
          }

          const waypoint = {
            id: `custom-${Date.now()}`,
            name: `Custom Waypoint ${flightPlan.waypoints.length + 1}`,
            type: 'custom' as const,
            coordinates,
            latitude: latDecimal,
            longitude: lonDecimal,
            nameEditable: true
          };
          
          setFlightPlan({
            ...flightPlan,
            waypoints: [...flightPlan.waypoints, waypoint]
          });
        }
      }
    } else {
      let lat = parseFloat(decimalLatitude);
      let lon = parseFloat(decimalLongitude);

      if (!isNaN(lat) && !isNaN(lon)) {
        let coordinates: [number, number] = [lon, lat];

        if (bearing && distance) {
          const offset = calculateOffsetPoint(
            lat,
            lon,
            parseFloat(bearing),
            parseFloat(distance)
          );
          if (offset) {
            coordinates = [offset.lon, offset.lat];
            lat = offset.lat;
            lon = offset.lon;
          }
        }

        const waypoint = {
          id: `custom-${Date.now()}`,
          name: `Custom Waypoint ${flightPlan.waypoints.length + 1}`,
          type: 'custom' as const,
          coordinates,
          latitude: lat,
          longitude: lon,
          nameEditable: true
        };

        setFlightPlan({
          ...flightPlan,
          waypoints: [...flightPlan.waypoints, waypoint]
        });
      }
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-md font-semibold mb-2">Add Custom Waypoint</h3>
      <div className="flex space-x-4 mb-2">
        <label className="inline-flex items-center">
          <input
            type="radio"
            value="DMS"
            checked={coordinateInputMode === 'DMS'}
            onChange={(e) => setCoordinateInputMode(e.target.value as 'DMS')}
            className="form-radio"
          />
          <span className="ml-2">DMS (度分秒)</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            value="Decimal"
            checked={coordinateInputMode === 'Decimal'}
            onChange={(e) => setCoordinateInputMode(e.target.value as 'Decimal')}
            className="form-radio"
          />
          <span className="ml-2">Decimal (10進数)</span>
        </label>
      </div>

      {/* 座標入力フィールド */}
      <div className="space-y-4">
        {coordinateInputMode === 'DMS' ? (
          <>
            <DmsInput
              label="緯度"
              value={dmsLatitude}
              onChange={setDmsLatitude}
              latitude={true}
            />
            <DmsInput
              label="経度"
              value={dmsLongitude}
              onChange={setDmsLongitude}
              latitude={false}
            />
          </>
        ) : (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">緯度 (±90.000000)</label>
              <input
                type="text"
                value={decimalLatitude}
                onChange={(e) => setDecimalLatitude(e.target.value)}
                placeholder="例: 35.123456"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">経度 (±180.000000)</label>
              <input
                type="text"
                value={decimalLongitude}
                onChange={(e) => setDecimalLongitude(e.target.value)}
                placeholder="例: 139.123456"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
        )}

        {/* オフセット入力フィールド */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">オフセット (オプション)</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">方位 (度)</label>
              <input
                type="number"
                value={bearing}
                onChange={(e) => setBearing(e.target.value)}
                placeholder="0-360"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                min="0"
                max="360"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">距離 (海里)</label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="距離"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* 追加ボタン */}
        <button
          onClick={handleAddWaypoint}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Waypoint
        </button>
      </div>
    </div>
  );
};

export default WaypointForm; 