import React from 'react';
import { FlightPlan } from '../types';

interface FlightSummaryProps {
  flightPlan: FlightPlan;
}

/**
 * Flight Summary コンポーネント
 * 総距離、ETE、ETAの表示を行う
 */
const FlightSummary: React.FC<FlightSummaryProps> = ({ flightPlan }) => {
  // 追加: FlightPlan props の情報をログ出力
  console.log('FlightSummary Props:', flightPlan);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Flight Summary</h2>
      <dl className="space-y-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">Departure</dt>
          <dd className="mt-1 text-lg font-semibold">
            {flightPlan.departure && `${flightPlan.departure.label}`}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Arrival</dt>
          <dd className="mt-1 text-lg font-semibold">
            {flightPlan.arrival && `${flightPlan.arrival.label})`}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Total Distance</dt>
          <dd className="mt-1 text-lg font-semibold">{flightPlan.totalDistance ? flightPlan.totalDistance.toFixed(1) : '0'} NM</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Estimated Time Enroute</dt>
          <dd className="mt-1 text-lg font-semibold">{flightPlan.ete || '00:00'}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Estimated Arrival Time</dt>
          <dd className="mt-1 text-lg font-semibold">{flightPlan.eta || '--:--'}</dd>
        </div>
      </dl>
    </div>
  );
};

export default FlightSummary; 