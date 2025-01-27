import React, { useState, useEffect } from 'react';

interface DmsInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    latitude?: boolean; // 緯度入力かどうか
}

/**
 * DMS形式のテキスト入力コンポーネント (簡略版)
 *
 * 入力形式: 緯度(6桁整数), 経度(7桁整数)
 *   緯度: DDMMSS (DD:度, MM:分, SS:秒)
 *   経度: DDDMMSS (DDD:度, MM:分, SS:秒)
 *
 * 方位記号(N, S, E, W)はオプションで、数値の前後どちらに付与しても認識します。
 * 例: "N345678", "345678N", "345678" (緯度), "E1234567", "1234567E", "1234567" (経度)
 */
const DmsInput: React.FC<DmsInputProps> = ({ label, value, onChange, latitude }) => {
    const [degrees, setDegrees] = useState<string>('');
    const [minutes, setMinutes] = useState<string>('');
    const [seconds, setSeconds] = useState<string>('');
    const [error, setError] = useState< string | null >(null); // エラーメッセージの状態を追加

    useEffect(() => {
        parseDMSValue(value);
    }, [value]);

    const parseDMSValue = (dmsValue: string) => {
        const regex = latitude ? /([NS])?(\d{2})?(\d{2})?(\d{2})?([NS])?/i : /([EW])?(\d{3})?(\d{2})?(\d{2})?([EW])?/i;
        const match = dmsValue.match(regex);

        if (match) {
            let deg = match[2] || '';
            let min = match[3] || '';
            let sec = match[4] || '';

            setDegrees(deg);
            setMinutes(min);
            setSeconds(sec);
        } else {
            setDegrees('');
            setMinutes('');
            setSeconds('');
        }
    };

    const formatDMSValue = () => {
        let formattedValue = '';
        formattedValue += degrees.padStart(latitude ? 2 : 3, '0');
        formattedValue += minutes.padStart(2, '0');
        formattedValue += seconds.padStart(2, '0');
        return formattedValue;
    };

    const handleFieldChange = (field: 'degrees' | 'minutes' | 'seconds', newValue: string) => {
        let isValid = true;
        let errorMessage = null;

        if (isNaN(Number(newValue))) {
            isValid = false;
            errorMessage = '数値を入力してください';
        } else {
            const numValue = Number(newValue);
            if (field === 'degrees') {
                if (latitude) {
                    if (numValue < 0 || numValue > 90) {
                        isValid = false;
                        errorMessage = '0-90度の範囲で入力してください';
                    }
                } else {
                    if (numValue < 0 || numValue > 180) {
                        isValid = false;
                        errorMessage = '0-180度の範囲で入力してください';
                    }
                }
            } else if (field === 'minutes' || field === 'seconds') {
                if (numValue < 0 || numValue > 59) {
                    isValid = false;
                    errorMessage = '0-59の範囲で入力してください';
                }
            }
        }

        setError(errorMessage); // エラーメッセージを設定

        if (isValid) {
            setError(null);
            switch (field) {
                case 'degrees':
                    setDegrees(newValue);
                    break;
                case 'minutes':
                    setMinutes(newValue);
                    break;
                case 'seconds':
                    setSeconds(newValue);
                    break;
                default:
                    break;
            }
        }
    };

    useEffect(() => {
        if (!error) {
            onChange(formatDMSValue());
        }
    }, [degrees, minutes, seconds, onChange, error]);

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-white-700 mb-2">{label}</label>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={degrees}
                    onChange={(e) => handleFieldChange('degrees', e.target.value)}
                    placeholder="度(DD)"
                    className="w-20 rounded border-gray-300"
                    maxLength={latitude ? 2 : 3}
                />
                <input
                    type="text"
                    value={minutes}
                    onChange={(e) => handleFieldChange('minutes', e.target.value)}
                    placeholder="分(MM)"
                    className="w-20 rounded border-gray-300"
                    maxLength={2}
                />
                <input
                    type="text"
                    value={seconds}
                    onChange={(e) => handleFieldChange('seconds', e.target.value)}
                    placeholder="秒(00)"
                    className="w-20 rounded border-gray-300"
                    maxLength={2}
                />
            </div>
            {error && <p className="mt-1 text-red-500 text-sm">{error}</p>} {/* エラーメッセージ表示 */}
        </div>
    );
};

export default DmsInput; 