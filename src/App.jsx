import React from 'react';
import { useIncubatorData } from './hooks/useIncubatorData';
import { DashboardLayout } from './components/DashboardLayout';
import { ProgressTracker } from './components/ProgressTracker';
import { MetricCard } from './components/MetricCard';
import { StatusCard } from './components/StatusCard';
import { ActuatorStatus } from './components/ActuatorStatus';
import { HistoryChart } from './components/HistoryChart';

function App() {
  const { data, startNewIncubation, stopIncubation } = useIncubatorData();

  return (
    <DashboardLayout isOffline={data.isDeviceOffline}>
      <div className="space-y-6">
        <ProgressTracker 
          data={data} 
          onStart={startNewIncubation} 
          onStop={stopIncubation} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Avg Temperature"
            value={data.temperature}
            unit="°C"
            type="temperature"
          />
          <MetricCard
            title="Avg Humidity"
            value={data.humidity}
            unit="%"
            type="humidity"
          />
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatusCard
              title="Tank Water Level"
              value={data.waterLevel}
              type="water"
            />
            <StatusCard
              title="Last Egg Turn"
              value={data.lastTurnTimestamp}
              type="tray"
            />
          </div>
        </div>

        <ActuatorStatus actuators={data.actuators} />

        <HistoryChart data={data.history} />
      </div>
    </DashboardLayout>
  );
}

export default App;
