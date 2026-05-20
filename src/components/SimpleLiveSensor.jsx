import React, { useState, useEffect } from 'react';

const SimpleLiveSensor = () => {
  const [data, setData] = useState({ distance: 0, status: "LOADING", timestamp: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSensor = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/sensor-data');
        if (!response.ok) throw new Error("Failed to fetch");
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError("Cannot connect to sensor");
        console.error(err);
      }
    };

    fetchSensor();
    const interval = setInterval(fetchSensor, 1000); // Update every 1 second

    return () => clearInterval(interval);
  }, []);

  const getColor = (status) => {
    if (status === "PASSENGER") return "text-red-500";
    if (status === "LUGGAGE") return "text-orange-500";
    if (status === "EMPTY") return "text-green-500";
    return "text-gray-400";
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Live Seat Status</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-500 text-sm">LIVE</span>
        </div>
      </div>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-6xl font-bold text-white">
              {data.distance} <span className="text-2xl text-gray-400">mm</span>
            </p>
          </div>

          <div className={`text-3xl font-bold ${getColor(data.status)}`}>
            {data.status}
          </div>

          <div className="text-sm text-gray-500">
            Last updated: {data.timestamp ? new Date(data.timestamp * 1000).toLocaleTimeString() : 'Just now'}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleLiveSensor;