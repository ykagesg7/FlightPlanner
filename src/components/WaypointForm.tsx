import React, { useState } from 'react';
import DmsInput from './DmsInput';
import { calculateOffsetPoint } from '../utils/offset'; // Import from offset.ts
import { FlightPlan } from '../types';

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

  const dmsToDecimal = (dms: string, isLatitude: boolean) => {
    // DMSからDecimalへの変換ロジック (utils/index.tsから移動)
    const regex = isLatitude ? /([NS])(\d{2})°(\d{2})'(\d{2})"/ : /([EW])(\d{3})°(\d{2})'(\d{2})"/;
    const match = dms.toUpperCase().match(regex);

    if (!match) {
      console.error("DMS形式の変換エラー: 無効なフォーマット", dms);
      return null;
    }

    const hemisphere = match[1];
    const degrees = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);
    const seconds = parseInt(match[4], 10);

    let decimal = degrees + minutes / 60 + seconds / 3600;

    if (hemisphere === 'S' || hemisphere === 'W') {
      decimal = -decimal;
    }

    return decimal;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-sm mt-8">
      <legend className="text-lg font-semibold mb-4 text-gray-50">Add Waypoint</legend>

      {/* 座標入力モード切り替え */}
      <div className="mb-4">
        <label className="inline-flex items-center cursor-pointer text-gray-400">
          <input
            type="radio"
            className="form-radio text-blue-500"
            name="coordinateInputMode"
            value="DMS"
            checked={coordinateInputMode === 'DMS'}
            onChange={() => setCoordinateInputMode('DMS')}
          />
          <span className="ml-2">DMS入力</span>
        </label>
        <label className="inline-flex items-center cursor-pointer ml-4 text-gray-400">
          <input
            type="radio"
            className="form-radio text-blue-500"
            name="coordinateInputMode"
            value="Decimal"
            checked={coordinateInputMode === 'Decimal'}
            onChange={() => setCoordinateInputMode('Decimal')}
          />
          <span className="ml-2">Decimal入力</span>
        </label>
      </div>

      {/* DMS入力フィールド */}
      {coordinateInputMode === 'DMS' ? (
        <div className="space-y-2">
          <DmsInput
            label="緯度 (DMS)"
            value={dmsLatitude}
            onChange={setDmsLatitude}
            latitude={true}
          />
          <DmsInput
            label="経度 (DMS)"
            value={dmsLongitude}
            onChange={setDmsLongitude}
            latitude={false}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-400">緯度 (±90.000000)</label>
            <input
              type="text"
              value={decimalLatitude}
              onChange={(e) => setDecimalLatitude(e.target.value)}
              placeholder="例: 35.123456"
              className="mt-1 block w-full rounded-md border-gray-700 shadow-sm bg-gray-800 text-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">経度 (±180.000000)</label>
            <input
              type="text"
              value={decimalLongitude}
              onChange={(e) => setDecimalLongitude(e.target.value)}
              placeholder="例: 139.123456"
              className="mt-1 block w-full rounded-md border-gray-700 shadow-sm bg-gray-800 text-gray-50"
            />
          </div>
        </div>
      )}

      {/* オフセット入力フィールド */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-400">オフセット (オプション)</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-400">方位 (度)</label>
            <input
              type="number"
              value={bearing}
              onChange={(e) => setBearing(e.target.value)}
              placeholder="0-360"
              className="mt-1 block w-full rounded-md border-gray-700 shadow-sm bg-gray-800 text-gray-50"
              min="0"
              max="360"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">距離 (海里)</label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="距離"
              className="mt-1 block w-full rounded-md border-gray-700 shadow-sm bg-gray-800 text-gray-50"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* 追加ボタン */}
      <button
        onClick={handleAddWaypoint}
        className="mt-2 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Add Waypoint
      </button>
    </div>
  );
};

export default WaypointForm; 