/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import api from '../lib/apiClient';

const SimulationContext = createContext(null);

export const useSimulation = () => useContext(SimulationContext);

export const SimulationProvider = ({ children }) => {
  const [demoMode, setDemoMode] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [stats, setStats] = useState({
    totalIncidents: 124,
    activeThreats: 3,
    quarantinedDevices: 12,
    avgResponseTime: '2.4s'
  });

  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const isDemoFallback = useRef(false);

  // Helper for generating standard timeline events based on alerts
  const syncAlertsToTimeline = useCallback((fetchedAlerts) => {
      // Very naive mapping for demo visuals
      const newTimeline = fetchedAlerts.map(a => ({
         id: a.id,
         title: a.title,
         description: a.recommendedResponse,
         type: a.severity === 'critical' ? 'critical' : a.severity === 'high' ? 'warning' : 'info',
         timestamp: a.timestamp
      }));
      setTimelineEvents(newTimeline.slice(0, 20));
  }, []);

  const fetchAlerts = useCallback(async () => {
      try {
          const res = await api.get('/alerts', { timeout: 2000 });
          if (res.data && res.data.success) {
              setAlerts(res.data.data.slice(0, 50));
              syncAlertsToTimeline(res.data.data);
              isDemoFallback.current = false;
          }
      } catch (e) {
          console.warn("Backend unavailable, falling back to local demo mode generation.");
          isDemoFallback.current = true;
      }
  }, [syncAlertsToTimeline]);

  // Alert Polling (2s)
  useEffect(() => {
     fetchAlerts(); // Initial fetch
     const interval = setInterval(fetchAlerts, 2000);
     return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Real backend simulation trigger
  const triggerSimulation = async () => {
    if (simulationActive) return;
    setSimulationActive(true);
    setSimulationStep(1); // Visual active state

    try {
        await api.post('/simulate-attack', {}, { timeout: 3000 });
        // Immediately fetch alerts to show the new ones
        setTimeout(() => fetchAlerts(), 500);
        setTimeout(() => setSimulationStep(5), 1500); // Visual end state
        setTimeout(() => {
           setSimulationActive(false);
           setSimulationStep(0);
        }, 3000);
    } catch (e) {
        console.error("Simulation API failed, running local fallback simulation");
        runLocalSimulationFallback();
    }
  };

  const addLocalFallbackAlert = useCallback((alert) => {
    setAlerts(prev => [
      { id: uuidv4(), timestamp: new Date().toISOString(), ...alert },
      ...prev
    ].slice(0, 50));
    setTimelineEvents(prev => [
      { id: uuidv4(), timestamp: new Date().toISOString(), title: alert.title, description: alert.recommendedResponse, type: alert.severity === 'critical' ? 'critical' : 'warning' },
      ...prev
    ].slice(0, 50));
  }, []);

  // Local engine fallback if backend is fully down
  const runLocalSimulationFallback = () => {
     setSimulationStep(1);
     setTimeout(() => addLocalFallbackAlert({ title: "Phishing Attempt", severity: "medium", source: "Email Gateway", affectedUser: "jdoe@company.com", recommendedResponse: "Block Sender IP" }), 0);
     setTimeout(() => {
        setSimulationStep(2);
        addLocalFallbackAlert({ title: "Anomalous Login Location", severity: "high", source: "Auth Service", affectedUser: "jdoe@company.com", recommendedResponse: "Require MFA" });
     }, 2000);
     setTimeout(() => {
        setSimulationStep(4);
        addLocalFallbackAlert({ title: "Ransomware Behavior Pattern", severity: "critical", source: "Endpoint Agent", affectedUser: "DESKTOP-JDOE", recommendedResponse: "Isolate Host" })
     }, 4000);
     setTimeout(() => {
         setSimulationStep(5);
         setSimulationActive(false);
     }, 6000);
  };

  // Demo Mode random background noise generator (fallback or true demo)
  useEffect(() => {
    if (!demoMode || simulationActive) return;

    const interval = setInterval(() => {
      const isSignificant = Math.random() > 0.8;
      if (isSignificant && isDemoFallback.current) {
        const severities = ['low', 'medium', 'high'];
        const types = ['Firewall Block', 'Failed Login', 'Port Scan Detect', 'Malware Sandbox Analysis'];
        
        addLocalFallbackAlert({
          title: types[Math.floor(Math.random() * types.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          source: 'Network Sensor',
          affectedUser: `User-${Math.floor(Math.random() * 1000)}`,
          recommendedResponse: 'Monitor'
        });
      } else if (demoMode && !isDemoFallback.current) {
           // If backend is alive, we could optionally tell backend to spawn an event, 
           // but for now, we'll just let polling capture anything, or we can push a dummy event via API.
           if (isSignificant) {
                api.post('/activity', {
                    type: Math.random() > 0.5 ? 'phish_click' : 'suspicious_login',
                    user: `User-${Math.floor(Math.random() * 100)}`,
                    description: 'Background demo noise mapping'
                }).catch(() => {});
           }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [demoMode, simulationActive, addLocalFallbackAlert]);

  return (
    <SimulationContext.Provider value={{
      demoMode,
      setDemoMode,
      alerts,
      timelineEvents,
      stats,
      triggerSimulation,
      simulationActive,
      simulationStep
    }}>
      {children}
    </SimulationContext.Provider>
  );
};
