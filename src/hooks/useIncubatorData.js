// src/hooks/useIncubatorData.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { differenceInDays, differenceInHours } from 'date-fns';

export function useIncubatorData() {
  const [data, setData] = useState({
    startDate: null,
    sessionActive: false,
    elapsedDays: 0,
    elapsedHours: 0,
    temperature: 0,
    humidity: 0,
    waterLevel: true, 
    lastTurnTimestamp: new Date().toISOString(),
    actuators: { heater: false, fan: false, pump: false, servo: false },
    history: [],
    lastUpdateTimestamp: null, 
    isDeviceOffline: false     
  });

  // 1. Fungsi Memulai Sesi
  const startNewIncubation = async () => {
    const now = new Date().toISOString();
    setData(prev => ({ ...prev, startDate: now, sessionActive: true, elapsedDays: 0, elapsedHours: 0 }));
    
    const { error } = await supabase
      .from('system_settings')
      .update({ incubation_start_date: now, is_active: true })
      .eq('id', 1);
      
    if (error) console.error("Gagal memulai sesi di DB:", error);
  };

  // 2. Fungsi Menghentikan Sesi
  const stopIncubation = async () => {
    setData(prev => ({ ...prev, startDate: null, sessionActive: false, elapsedDays: 0, elapsedHours: 0 }));
    
    const { error } = await supabase
      .from('system_settings')
      .update({ incubation_start_date: null, is_active: false })
      .eq('id', 1);
      
    if (error) console.error("Gagal menghentikan sesi di DB:", error);
  };

  // 3. Efek Timer (Menghitung Hari, Jam, dan Jadwal Servo 4 Jam)
  useEffect(() => {
    let timerInterval;
    if (data.sessionActive && data.startDate) {
      timerInterval = setInterval(() => {
        const start = new Date(data.startDate);
        const now = new Date();
        const elapsedMs = now.getTime() - start.getTime();
        
        const days = differenceInDays(now, start);
        const hours = differenceInHours(now, start) % 24;
        const currentDay = Math.floor(elapsedMs / 86400000) + 1; // Hari ke-n

        setData(prev => {
          let newLastTurn = prev.lastTurnTimestamp;
          
          // Jika masuk masa Hatching (Hari 19+), indikator servo dihentikan
          if (currentDay >= 19) {
            newLastTurn = 'STOPPED';
          } else {
            // Kalkulasi kelipatan 4 jam (14.400.000 ms) dari waktu mulai
            const fourHours = 4 * 60 * 60 * 1000;
            const cycles = Math.floor(elapsedMs / fourHours);
            newLastTurn = new Date(start.getTime() + (cycles * fourHours)).toISOString();
          }

          if (prev.elapsedDays !== days || prev.elapsedHours !== hours || prev.lastTurnTimestamp !== newLastTurn) {
             return { ...prev, elapsedDays: days, elapsedHours: hours, lastTurnTimestamp: newLastTurn };
          }
          return prev;
        });
      }, 1000); 
    }
    return () => clearInterval(timerInterval);
  }, [data.sessionActive, data.startDate]);

  // 4. Efek Watchdog Timer (Mendeteksi Alat Mati)
  useEffect(() => {
    const watchdog = setInterval(() => {
      setData(prev => {
        if (!prev.lastUpdateTimestamp) return prev;

        const lastTime = new Date(prev.lastUpdateTimestamp).getTime();
        const currentTime = Date.now();
        const timeDifference = currentTime - lastTime;

        // Jika tidak ada data baru > 30 detik, anggap alat MATI
        const isOffline = timeDifference > 30000;

        if (prev.isDeviceOffline !== isOffline) {
          return { ...prev, isDeviceOffline: isOffline };
        }
        return prev;
      });
    }, 2000); 

    return () => clearInterval(watchdog);
  }, []);

  // 5. Efek Utama: Ambil Data Awal & Subscribe Realtime
  useEffect(() => {
    
    const fetchSettings = async () => {
      const { data: settings } = await supabase.from('system_settings').select('*').eq('id', 1).single();
      if (settings) {
        setData(prev => ({ 
          ...prev, 
          startDate: settings.incubation_start_date, 
          sessionActive: settings.is_active 
        }));
      }
    };

    const fetchSensorHistory = async () => {
      const { data: historyData } = await supabase.from('sensor_data').select('*').order('created_at', { ascending: false }).limit(20);

      if (historyData && historyData.length > 0) {
        const formattedHistory = historyData.reverse().map(item => {
          const d = new Date(item.created_at);
          return { time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), temperature: item.suhu, humidity: item.kelembapan };
        });

        const latest = historyData[historyData.length - 1];

        // Logika Aktuator mengikuti rules ESP32
        const isHatching = (latest.hari || 1) >= 19;
        const hOn = isHatching ? latest.suhu < 36.8 : latest.suhu < 37.2;
        const fOn = isHatching ? latest.suhu > 37.5 : latest.suhu > 38.0;

        setData(prev => ({
          ...prev,
          temperature: latest.suhu || 0,
          humidity: latest.kelembapan || 0,
          waterLevel: !latest.air_habis, // Konversi logika sensor air
          actuators: { heater: hOn, fan: fOn, pump: latest.pompa, servo: false },
          history: formattedHistory,
          lastUpdateTimestamp: latest.created_at
        }));
      }
    };

    fetchSettings();
    fetchSensorHistory();

    const channel = supabase.channel('dashboard-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_data' }, (payload) => {
          const record = payload.new;
          const d = new Date(record.created_at);
          const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          setData(prev => {
            const newHistory = [...prev.history, { time: timeStr, temperature: record.suhu, humidity: record.kelembapan }].slice(-20);

            // Logika Aktuator mengikuti rules ESP32
            const isHatching = (record.hari || 1) >= 19;
            const hOn = isHatching ? record.suhu < 36.8 : record.suhu < 37.2;
            const fOn = isHatching ? record.suhu > 37.5 : record.suhu > 38.0;

            return {
              ...prev,
              temperature: record.suhu,
              humidity: record.kelembapan,
              waterLevel: !record.air_habis,
              actuators: { heater: hOn, fan: fOn, pump: record.pompa, servo: false },
              history: newHistory,
              lastUpdateTimestamp: record.created_at,
              isDeviceOffline: false 
            };
          });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_settings' }, (payload) => {
         const newSettings = payload.new;
         setData(prev => ({
           ...prev,
           startDate: newSettings.incubation_start_date,
           sessionActive: newSettings.is_active
         }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { data, startNewIncubation, stopIncubation };
}