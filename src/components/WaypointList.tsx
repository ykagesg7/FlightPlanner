import React from 'react';
import { FlightPlan, Waypoint } from '../types';
import { MapPin, ChevronUp, ChevronDown } from 'lucide-react';
import { formatDMS, decimalToDMS, dmsToDecimal, calculateOffsetPoint } from '../utils';
import DmsInput from './DmsInput';
import { formatBearing, formatDistance } from '../utils/format';

interface WaypointListProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
}

/**
 * Waypoint List コンポーネント
 * ウェイポイントのリスト表示と操作（移動、削除、各種編集モード）を行う
 */
const WaypointList: React.FC<WaypointListProps> = ({ flightPlan, setFlightPlan }) => {
  // 編集モードの状態を管理する変数
  const [editingMode, setEditingMode] = React.useState< 'name' | 'id' | 'position' | null >(null);
  const [editingWaypointIndex, setEditingWaypointIndex] = React.useState<number | null>(null);
  const [editingWaypoint, setEditingWaypoint] = React.useState<Waypoint | null>(null);

  // 編集対象Waypointの磁方位と距離
  const [editingBearing, setEditingBearing] = React.useState<string>('');
  const [editingDistance, setEditingDistance] = React.useState<string>('');

  // 緯度経度編集用 state
  const [dmsLatitude, setDmsLatitude] = React.useState<string>('');
  const [dmsLongitude, setDmsLongitude] = React.useState<string>('');

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

  // ウェイポイントの編集開始ハンドラー
  const handleStartEdit = (index: number, mode: 'name' | 'id' | 'position') => {
    setEditingMode(mode);
    setEditingWaypointIndex(index);
    setEditingWaypoint({ ...flightPlan.waypoints[index] });

    const wp = flightPlan.waypoints[index];

    if (mode === 'id') {
      // ID編集モードの場合、オフセット情報を設定 (NAVAID選択は削除)
      if (wp.metadata) {
        setEditingBearing(wp.metadata.bearing.toString());
        setEditingDistance(wp.metadata.distance.toString());
      } else {
        // metadataがない場合は、編集モードをキャンセル (念のため)
        handleCancelEdit();
      }
    } else if (mode === 'position') {
      // 位置編集モードの場合、DMS形式の初期値を設定
      const dms = decimalToDMS(wp.latitude, wp.longitude);
      setDmsLatitude(dms.latDMS);
      setDmsLongitude(dms.lonDMS);
    }
  };

  // ウェイポイントの編集キャンセルハンドラー
  const handleCancelEdit = () => {
    setEditingMode(null);
    setEditingWaypointIndex(null);
    setEditingWaypoint(null);
    setEditingBearing('');
    setEditingDistance('');
    setDmsLatitude('');
    setDmsLongitude('');
  };

  // ウェイポイントの編集保存ハンドラー
  const handleSaveEdit = () => {
    if (editingWaypointIndex === null || !editingWaypoint) return;

    let updatedWaypoint: Waypoint = { ...editingWaypoint };

    if (editingMode === 'id') {
      // ID編集モードの保存処理：オフセット値のみを更新
      if (editingBearing && editingDistance && editingWaypoint.metadata) { // metadataの存在をチェック
        const bearingNum = parseFloat(editingBearing);
        const distanceNum = parseFloat(editingDistance);

        if (isNaN(bearingNum) || isNaN(distanceNum)) {
          console.error('[ERROR] 無効な数値入力:', { bearing: editingBearing, distance: editingDistance });
          return;
        }

        const offset = calculateOffsetPoint(
          editingWaypoint.metadata.baseLatitude, // 元のNAVAIDの緯度を使用
          editingWaypoint.metadata.baseLongitude, // 元のNAVAIDの経度を使用
          bearingNum,
          distanceNum
        );

        if (offset) {
          const formattedBearing = formatBearing(bearingNum);
          const formattedDistance = formatDistance(distanceNum);
          updatedWaypoint = {
            ...updatedWaypoint,
            coordinates: [offset.lon, offset.lat],
            latitude: offset.lat,
            longitude: offset.lon,
            metadata: {
              ...editingWaypoint.metadata, // 既存のmetadataを保持
              bearing: bearingNum,
              distance: distanceNum,
            }
          };
          // IDと名前を更新 (formattedBearingを使用)
          updatedWaypoint.id = `${updatedWaypoint.metadata.baseNavaid}_${formattedBearing}/${formattedDistance}`;
          updatedWaypoint.name = `${updatedWaypoint.name.split(' ')[0]} (${formattedBearing}/${formattedDistance})`;
        }
      }
    } else if (editingMode === 'position') {
      // 位置編集モードの保存処理
      const latDecimal = dmsToDecimal(dmsLatitude, true);
      const lonDecimal = dmsToDecimal(dmsLongitude, false);
      if (latDecimal !== null && lonDecimal !== null) {
        updatedWaypoint = {
          ...updatedWaypoint,
          coordinates: [lonDecimal, latDecimal],
          latitude: latDecimal,
          longitude: lonDecimal,
        };
      }
    } else if (editingMode === 'name') {
      // 名前編集モードの保存処理 (名前はinput要素で直接編集)
    }

    // ウェイポイントを更新
    const updatedWaypoints = [...flightPlan.waypoints];
    updatedWaypoints[editingWaypointIndex] = updatedWaypoint;
    setFlightPlan({ ...flightPlan, waypoints: updatedWaypoints });

    // 編集状態をリセット
    handleCancelEdit();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Waypoint List</h2>
      <ul>
        {flightPlan.waypoints.map((waypoint, index) => (
          <li key={index} className="mb-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                {/* ウェイポイント名 (1行目) */}
                {editingMode === 'name' && editingWaypointIndex === index ? (
                  <input
                    type="text"
                    value={editingWaypoint.name}
                    onChange={(e) => setEditingWaypoint({ ...editingWaypoint, name: e.target.value })}
                    className="mt-1 block rounded-md border-gray-300 shadow-sm"
                  />
                ) : (
                  <button
                    onClick={() => handleStartEdit(index, 'name')}
                    className="text-left hover:underline font-semibold"
                  >
                    {waypoint.name}
                  </button>
                )}
              </div>

              {/* 編集モードの場合、保存とキャンセルボタンを表示（共通） */}
              {editingMode !== null && editingWaypointIndex === index && (
                <div className="space-x-2">
                  <button onClick={handleSaveEdit} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">保存</button>
                  <button onClick={handleCancelEdit} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">キャンセル</button>
                </div>
              )}

              {/* ウェイポイントの移動と削除ボタン（共通） */}
              <div className="flex items-center space-x-2">
                <button onClick={() => handleMoveWaypointUp(index)} className="p-1 rounded-full hover:bg-gray-200" aria-label="Move Waypoint Up"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => handleMoveWaypointDown(index)} className="p-1 rounded-full hover:bg-gray-200" aria-label="Move Waypoint Down"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => handleRemoveWaypoint(index)} className="p-1 rounded-full hover:bg-red-200 text-red-500" aria-label="Remove Waypoint">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-4.5 5.25a.75.75 0 0 0-1.06 1.06L10.94 12l-4.5 4.5a.75.75 0 1 0 1.06 1.06L12 13.06l4.5 4.5a.75.75 0 1 0 1.06-1.06L13.06 12l4.5-4.5a.75.75 0 0 0-1.06-1.06L12 10.94 7.5 6.44Z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>

            {/* 詳細情報の表示 (ID, 位置) */}
            <div className="text-sm text-gray-500 mt-1">
              {/* ID (2行目) - 編集モード */}
              {editingMode === 'id' && editingWaypointIndex === index ? (
                <div className="space-y-2">
                  {/* NAVAID選択を削除し、磁方位と距離の入力フィールドのみ表示 */}
                  {/* <NavaidSelector
                    options={navaidOptions}
                    selectedNavaid={editingNavaid}
                    setSelectedNavaid={setEditingNavaid}
                    onAdd={() => {}}
                  /> */}
                  {/* <AirportSelect
                    label="NAVAID"
                    options={navaidOptions}
                    selectedOption={editingNavaid}
                    onChange={setEditingNavaid}
                    placeholder="Select Navaid"
                  /> */}

                  {/* 磁方位と距離の入力 (オフセットWaypointのみ) - 常に表示 */}
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">磁方位(°)</label>
                      <input
                        type="number"
                        value={editingBearing}
                        onChange={(e) => setEditingBearing(e.target.value)}
                        placeholder="0 - 360"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        min="0"
                        max="360"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">距離(nm)</label>
                      <input
                        type="number"
                        value={editingDistance}
                        onChange={(e) => setEditingDistance(e.target.value)}
                        placeholder="例: 10"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        min="0"
                      />
                    </div>
                  </>
                </div>
              ) : (
                // ID (2行目) - 通常表示
                <div onClick={() => handleStartEdit(index, 'id')} className="cursor-pointer hover:underline">
                  <span className="text-sm text-gray-500">ID: {waypoint.id}</span>
                </div>
              )}

              {/* 位置情報 (3行目) - 編集モード（既存） */}
              {editingMode === 'position' && editingWaypointIndex === index ? (
                <div className="space-y-2">
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
                </div>
              ) : (
                // 位置情報 (3行目) - 通常表示（既存）
                <div
                  onClick={() => handleStartEdit(index, 'position')}
                  className="cursor-pointer hover:underline mt-2"
                >
                  位置: {formatDMS(waypoint.latitude, waypoint.longitude)}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WaypointList; 