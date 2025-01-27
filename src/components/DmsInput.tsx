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
    // 内部状態を分割して管理
    const [direction, setDirection] = useState<string>(latitude ? 'N' : 'E');
    const [degrees, setDegrees] = useState<string>('');
    const [minutes, setMinutes] = useState<string>('');
    const [seconds, setSeconds] = useState<string>('');

    // 外部のvalue値が変更された時に内部状態を更新
    useEffect(() => {
        if (!value) {
            // 値がクリアされた場合は内部状態もクリア
            setDegrees('');
            setMinutes('');
            setSeconds('');
            setDirection(latitude ? 'N' : 'E');
            return;
        }

        // 既存の値を分解して各フィールドに設定
        const numberPart = value.replace(/[NSEW]/g, '');
        const dir = value.match(/[NSEW]/)?.[0] || (latitude ? 'N' : 'E');
        
        if (latitude) {
            setDegrees(numberPart.substring(0, 2));
            setMinutes(numberPart.substring(2, 4));
            setSeconds(numberPart.substring(4, 6));
        } else {
            setDegrees(numberPart.substring(0, 3));
            setMinutes(numberPart.substring(3, 5));
            setSeconds(numberPart.substring(5, 7));
        }
        setDirection(dir);
    }, [value, latitude]);

    // 各フィールドの変更をハンドル
    const handleFieldChange = (
        field: 'direction' | 'degrees' | 'minutes' | 'seconds',
        newValue: string
    ) => {
        let isValid = true;
        const numValue = parseInt(newValue, 10);

        switch (field) {
            case 'direction':
                setDirection(newValue);
                break;
            case 'degrees':
                if (newValue === '' || (/^\d{0,3}$/.test(newValue) && 
                    (latitude ? numValue <= 90 : numValue <= 180))) {
                    setDegrees(newValue);
                } else {
                    isValid = false;
                }
                break;
            case 'minutes':
                if (newValue === '' || (/^\d{0,2}$/.test(newValue) && numValue < 60)) {
                    setMinutes(newValue);
                } else {
                    isValid = false;
                }
                break;
            case 'seconds':
                if (newValue === '' || (/^\d{0,2}$/.test(newValue) && numValue < 60)) {
                    setSeconds(newValue);
                } else {
                    isValid = false;
                }
                break;
        }

        if (isValid) {
            // 全フィールドが入力されている場合のみ親コンポーネントに通知
            const degreesComplete = latitude ? degrees.length === 2 : degrees.length === 3;
            const minutesComplete = minutes.length === 2;
            const secondsComplete = seconds.length === 2;

            if (degreesComplete && minutesComplete && secondsComplete) {
                const dmsString = `${direction}${degrees}${minutes}${seconds}`;
                onChange(dmsString);
            }
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="flex space-x-2">
                <select
                    value={direction}
                    onChange={(e) => handleFieldChange('direction', e.target.value)}
                    className="w-20 rounded border-gray-300"
                >
                    {latitude ? (
                        <>
                            <option value="N">北緯(N)</option>
                            <option value="S">南緯(S)</option>
                        </>
                    ) : (
                        <>
                            <option value="E">東経(E)</option>
                            <option value="W">西経(W)</option>
                        </>
                    )}
                </select>
                <input
                    type="text"
                    value={degrees}
                    onChange={(e) => handleFieldChange('degrees', e.target.value)}
                    placeholder={latitude ? '度(00)' : '度(000)'}
                    className="w-20 rounded border-gray-300"
                    maxLength={latitude ? 2 : 3}
                />
                <input
                    type="text"
                    value={minutes}
                    onChange={(e) => handleFieldChange('minutes', e.target.value)}
                    placeholder="分(00)"
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
        </div>
    );
};

export default DmsInput; 