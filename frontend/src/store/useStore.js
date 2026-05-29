import { create } from 'zustand';

const initialSettings = {
  darkMode: true,
  enableNotifications: true,
  severityFilters: { critical: true, high: true, medium: true, low: true }
};

const initialState = {
  events: [],
  alerts: [],
  incidents: [],
  timelineEvents: [],
  userRisks: [],
  notifications: [],
  quarantinedDevices: [],
  reviewQueue: [],
  auditTrail: [],
  ruleStats: [],
  settings: initialSettings,
  metrics: {
    totalIncidents: 0,
    activeThreats: 0,
    quarantinedDevices: 0,
    avgResponseTime: 1.2,
    totalLoginAttempts: 0,
    blockedLoginAttempts: 0,
  },
  simulationActive: false,
};

const useStore = create((set, get) => ({
  ...initialState,

  // --- Actions ---

  addEvent: (event) => set((state) => {
    const isAlert = ['critical', 'high', 'medium'].includes(event.severity);
    
    // Add to raw events list
    const updatedEvents = [event, ...state.events].slice(0, 500);
    const updatedTimelineEvents = [event, ...state.timelineEvents].slice(0, 100);

    let updatedAlerts = state.alerts;
    let updatedUserRisks = [...state.userRisks];
    let updatedNotifications = [...state.notifications];
    let updatedMetrics = { ...state.metrics };

    if (isAlert) {
      const newAlert = {
        id: event.id,
        type: event.type,
        title: event.type.replace(/_/g, ' ').toUpperCase(),
        severity: event.severity,
        source: event.source_ip,
        targetUser: event.target_user,
        timestamp: event.timestamp,
        recommendedResponse: getMitigationRecommendation(event.type),
        system: event.system,
        resolved: false
      };

      updatedAlerts = [newAlert, ...state.alerts].slice(0, 100);

      // Auto-group into an incident if severity is high/critical
      if (['critical', 'high'].includes(event.severity)) {
         get().createIncidentFromAlert(newAlert);
      }

      // Update User Risk
      if (event.target_user && event.target_user !== 'system') {
         let points = event.severity === 'critical' ? 40 : event.severity === 'high' ? 25 : 10;
         const existingUserIdx = updatedUserRisks.findIndex(u => u.user === event.target_user);
         if (existingUserIdx >= 0) {
            updatedUserRisks[existingUserIdx].riskScore = Math.min(100, updatedUserRisks[existingUserIdx].riskScore + points);
            updatedUserRisks[existingUserIdx].lastActivity = event.timestamp;
         } else {
            updatedUserRisks.push({
               user: event.target_user,
               riskScore: points,
               lastActivity: event.timestamp
            });
         }
      }

      // Add Notification
      if (state.settings.enableNotifications) {
          updatedNotifications.unshift({
              id: crypto.randomUUID(),
              message: `New ${event.severity} alert: ${newAlert.title}`,
              type: event.severity,
              read: false,
              timestamp: event.timestamp
          });
          // cap notifications
          updatedNotifications = updatedNotifications.slice(0, 50);
      }
    }

    updatedMetrics.activeThreats = updatedAlerts.filter(a => !a.resolved).length;

    return {
      events: updatedEvents,
      timelineEvents: updatedTimelineEvents,
      alerts: updatedAlerts,
      userRisks: updatedUserRisks,
      notifications: updatedNotifications,
      metrics: updatedMetrics
    };
  }),

  // --- Incident Actions ---
  createIncidentFromAlert: (alert) => set((state) => {
     // rudimentary grouping: if an active incident exists for this user/system, append it.
     const existingIncidentIdx = state.incidents.findIndex(inc => 
         inc.status === 'active' && 
         (inc.targetUser === alert.targetUser || inc.system === alert.system)
     );

     let updatedIncidents = [...state.incidents];
     if (existingIncidentIdx >= 0) {
         updatedIncidents[existingIncidentIdx].relatedAlerts.push(alert.id);
         if (alert.severity === 'critical') updatedIncidents[existingIncidentIdx].severity = 'critical';
     } else {
         const newIncident = {
             id: `INC-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
             title: `Automated Incident: ${alert.title}`,
             severity: alert.severity,
             status: 'active',
             assignedTo: 'Unassigned',
             targetUser: alert.targetUser,
             system: alert.system,
             relatedAlerts: [alert.id],
             timestamp: new Date().toISOString()
         };
         updatedIncidents.unshift(newIncident);
     }

     return {
         incidents: updatedIncidents,
         metrics: { ...state.metrics, totalIncidents: updatedIncidents.length }
     };
  }),

  resolveIncident: (incidentId) => set((state) => {
      const updatedIncidents = state.incidents.map(inc => 
          inc.id === incidentId ? { ...inc, status: 'resolved' } : inc
      );

      // Optionally resolve all related alerts
      const incident = state.incidents.find(i => i.id === incidentId);
      let updatedAlerts = state.alerts;
      if (incident) {
          updatedAlerts = state.alerts.map(a => 
              incident.relatedAlerts.includes(a.id) ? { ...a, resolved: true } : a
          );
      }

      return {
          incidents: updatedIncidents,
          alerts: updatedAlerts,
          metrics: { ...state.metrics, activeThreats: updatedAlerts.filter(a => !a.resolved).length }
      };
  }),

  escalateIncident: (incidentId) => set((state) => {
      const updatedIncidents = state.incidents.map(inc => 
          inc.id === incidentId ? { ...inc, severity: 'critical', assignedTo: 'Security Lead' } : inc
      );
      return { incidents: updatedIncidents };
  }),

  // --- Remediation Actions ---
  mitigateAlert: (alertId) => set((state) => {
    const updatedAlerts = state.alerts.map(a => 
      a.id === alertId ? { ...a, resolved: true, resolutionTime: new Date().toISOString() } : a
    );
    return { 
      alerts: updatedAlerts,
      metrics: {
        ...state.metrics,
        activeThreats: updatedAlerts.filter(a => !a.resolved).length
      }
    };
  }),

  quarantineDevice: (systemOrIp) => set((state) => {
    if (state.quarantinedDevices.includes(systemOrIp)) return state;
    const qs = [...state.quarantinedDevices, systemOrIp];
    
    // Auto-resolve related alerts
    const updatedAlerts = state.alerts.map(a => 
        (a.source === systemOrIp || a.system === systemOrIp) ? { ...a, resolved: true } : a
    );

    return {
      quarantinedDevices: qs,
      alerts: updatedAlerts,
      metrics: {
        ...state.metrics,
        quarantinedDevices: qs.length,
        activeThreats: updatedAlerts.filter(a => !a.resolved).length
      },
      timelineEvents: [{
          id: crypto.randomUUID(), type: 'device_isolated', timestamp: new Date().toISOString(),
          description: `Host ${systemOrIp} isolated from network`, severity: 'info'
      }, ...state.timelineEvents].slice(0, 100)
    };
  }),

  requireMfa: (user) => set((state) => {
    // Reduce user risk slightly as mitigation
    const updatedUserRisks = state.userRisks.map(u => 
        (user === 'global_target' || u.user === user) ? { ...u, riskScore: Math.max(0, u.riskScore - 20) } : u
    );

    return {
      userRisks: updatedUserRisks,
      timelineEvents: [{
          id: crypto.randomUUID(), type: 'mfa_enforced', timestamp: new Date().toISOString(),
          description: `MFA enforced for user ${user === 'global_target' ? 'session' : user}`, severity: 'info'
      }, ...state.timelineEvents].slice(0, 100)
    };
  }),

  blockIp: (ip) => set((state) => {
      // Resolve alerts from this IP
      const updatedAlerts = state.alerts.map(a => 
          (a.source === ip) ? { ...a, resolved: true } : a
      );

      return {
          alerts: updatedAlerts,
          metrics: {
              ...state.metrics,
              activeThreats: updatedAlerts.filter(a => !a.resolved).length
          },
          timelineEvents: [{
              id: crypto.randomUUID(), type: 'ip_blocked', timestamp: new Date().toISOString(),
              description: `Firewall rule DROP applied for ${ip}`, severity: 'info'
          }, ...state.timelineEvents].slice(0, 100)
      };
  }),

  // --- Notification Actions ---
  addNotification: (notification) => set((state) => {
      if (!state.settings.enableNotifications) return state;
      return {
          notifications: [{ ...notification, id: crypto.randomUUID(), timestamp: new Date().toISOString(), read: false }, ...state.notifications].slice(0, 50)
      };
  }),
  markNotificationRead: (id) => set((state) => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  clearNotifications: () => set({ notifications: [] }),

  // --- Settings Actions ---
  updateSettings: (newSettings) => set((state) => ({
      settings: { ...state.settings, ...newSettings }
  })),

  // Simulation controls
  setSimulationActive: (isActive) => set({ simulationActive: isActive }),
  
  // Authentication Alerting
  recordLoginAttempt: (isBlocked, alertDetails) => set((state) => {
    let updatedMetrics = { 
        ...state.metrics, 
        totalLoginAttempts: state.metrics.totalLoginAttempts + 1 
    };
    if (isBlocked) {
        updatedMetrics.blockedLoginAttempts += 1;
    }
    
    let updatedAlerts = state.alerts;
    if (alertDetails) {
        const timestamp = Date.now();
        const severityStr = alertDetails.riskLevel === 'malicious' ? 'critical' : 'high';
        const newAlert = {
            id: `ALRT-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
            type: 'anomalous_login',
            title: 'UNSAFE LOGIN ATTEMPT',
            severity: severityStr,
            source: alertDetails.url,
            targetUser: alertDetails.email,
            timestamp: timestamp,
            recommendedResponse: 'Require MFA',
            system: 'Auth Service',
            resolved: false,
            description: `Login blocked due to ${alertDetails.riskLevel} risk score (${alertDetails.riskScore}%). Targeting domain: ${alertDetails.url}`,
            user: alertDetails.email,
        };
        updatedAlerts = [newAlert, ...state.alerts].slice(0, 100);
        updatedMetrics.activeThreats = updatedAlerts.filter(a => !a.resolved).length;
    }
    
    return {
        metrics: updatedMetrics,
        alerts: updatedAlerts
    };
  }),

  hydrateDemoWorkspace: () => {
    const now = Date.now();
    const iso = (minutesAgo) => new Date(now - minutesAgo * 60 * 1000).toISOString();

    const alerts = [
      {
        id: 'ALRT-9F2A81',
        type: 'credential_stuffing',
        title: 'CREDENTIAL STUFFING BURST',
        severity: 'critical',
        source: '185.220.101.42',
        targetUser: 'admin@sentinel.soc',
        timestamp: now - 2 * 60 * 1000,
        recommendedResponse: 'Block Source IPs',
        system: 'Auth Gateway',
        resolved: false,
        description: '42 failed login attempts from rotating exit nodes with reused password patterns.',
        user: 'admin@sentinel.soc',
        tactic: 'Credential Access',
        technique: 'T1110 Brute Force',
      },
      {
        id: 'ALRT-41C0BE',
        type: 'phishing_attempt',
        title: 'PHISHING URL DETECTED',
        severity: 'high',
        source: 'secure-login-suspicious[.]cloud',
        targetUser: 'finance.diana@sentinel.soc',
        timestamp: now - 8 * 60 * 1000,
        recommendedResponse: 'Block Sender Domain',
        system: 'Email Security',
        resolved: false,
        description: 'Lookalike login page observed with credential harvesting form and suspicious redirect chain.',
        user: 'finance.diana@sentinel.soc',
        tactic: 'Initial Access',
        technique: 'T1566 Phishing',
      },
      {
        id: 'ALRT-77DD12',
        type: 'anomalous_login',
        title: 'IMPOSSIBLE TRAVEL LOGIN',
        severity: 'high',
        source: '203.0.113.18',
        targetUser: 'dev.charlie@sentinel.soc',
        timestamp: now - 14 * 60 * 1000,
        recommendedResponse: 'Require MFA',
        system: 'Identity Provider',
        resolved: false,
        description: 'Successful login from Singapore 11 minutes after a verified India session.',
        user: 'dev.charlie@sentinel.soc',
        tactic: 'Defense Evasion',
        technique: 'T1078 Valid Accounts',
      },
      {
        id: 'ALRT-2B9E54',
        type: 'malware_callback',
        title: 'MALWARE CALLBACK BEACON',
        severity: 'medium',
        source: '198.51.100.77',
        targetUser: 'sales.bob@sentinel.soc',
        timestamp: now - 23 * 60 * 1000,
        recommendedResponse: 'Isolate Host',
        system: 'LAPTOP-SALES-021',
        resolved: false,
        description: 'Endpoint contacted a known command-and-control domain over uncommon TLS fingerprint.',
        user: 'sales.bob@sentinel.soc',
        tactic: 'Command and Control',
        technique: 'T1071 Application Layer Protocol',
      },
    ];

    const timelineEvents = [
      {
        id: 'EVT-1001',
        type: 'credential_stuffing',
        timestamp: iso(2),
        description: 'Auth gateway blocked password spray targeting privileged account.',
        severity: 'critical',
        source_ip: '185.220.101.42',
        target_user: 'admin@sentinel.soc',
        system: 'Auth Gateway',
      },
      {
        id: 'EVT-1002',
        type: 'phishing_link_opened',
        timestamp: iso(8),
        description: 'Finance user clicked a lookalike Microsoft 365 login page.',
        severity: 'high',
        source_ip: 'secure-login-suspicious[.]cloud',
        target_user: 'finance.diana@sentinel.soc',
        system: 'Email Security',
      },
      {
        id: 'EVT-1003',
        type: 'impossible_travel',
        timestamp: iso(14),
        description: 'Identity provider detected conflicting geolocation signals.',
        severity: 'high',
        source_ip: '203.0.113.18',
        target_user: 'dev.charlie@sentinel.soc',
        system: 'Identity Provider',
      },
      {
        id: 'EVT-1004',
        type: 'endpoint_beacon',
        timestamp: iso(23),
        description: 'Sales laptop generated repeated outbound beacon attempts.',
        severity: 'medium',
        source_ip: '198.51.100.77',
        target_user: 'sales.bob@sentinel.soc',
        system: 'LAPTOP-SALES-021',
      },
      {
        id: 'EVT-1005',
        type: 'mfa_challenge',
        timestamp: iso(31),
        description: 'Adaptive MFA challenge issued after new device fingerprint.',
        severity: 'low',
        source_ip: '10.20.4.18',
        target_user: 'analyst.mira@sentinel.soc',
        system: 'Identity Provider',
      },
    ];

    const incidents = [
      {
        id: 'INC-A91F23',
        title: 'Coordinated Identity Attack',
        severity: 'critical',
        status: 'active',
        assignedTo: 'Security Lead',
        targetUser: 'admin@sentinel.soc',
        system: 'Auth Gateway',
        relatedAlerts: ['ALRT-9F2A81', 'ALRT-77DD12'],
        timestamp: iso(3),
        tactics: ['Credential Access', 'Defense Evasion'],
        entities: ['admin@sentinel.soc', 'Auth Gateway', '185.220.101.42'],
        nextBestAction: 'Block source IPs, reset privileged credentials, and require MFA re-enrollment.',
      },
      {
        id: 'INC-B70C14',
        title: 'Finance Phishing Campaign',
        severity: 'high',
        status: 'active',
        assignedTo: 'SOC Analyst',
        targetUser: 'finance.diana@sentinel.soc',
        system: 'Email Security',
        relatedAlerts: ['ALRT-41C0BE'],
        timestamp: iso(9),
        tactics: ['Initial Access', 'Credential Access'],
        entities: ['finance.diana@sentinel.soc', 'Email Security', 'secure-login-suspicious[.]cloud'],
        nextBestAction: 'Block sender domain, search mailbox exposure, and warn affected users.',
      },
    ];

    const userRisks = [
      { user: 'admin@sentinel.soc', riskScore: 92, lastActivity: iso(2) },
      { user: 'finance.diana@sentinel.soc', riskScore: 78, lastActivity: iso(8) },
      { user: 'dev.charlie@sentinel.soc', riskScore: 71, lastActivity: iso(14) },
      { user: 'sales.bob@sentinel.soc', riskScore: 58, lastActivity: iso(23) },
      { user: 'analyst.mira@sentinel.soc', riskScore: 34, lastActivity: iso(31) },
    ];

    const notifications = alerts.slice(0, 3).map((alert) => ({
      id: `NTF-${alert.id}`,
      message: `New ${alert.severity} alert: ${alert.title}`,
      type: alert.severity,
      read: false,
      timestamp: new Date(alert.timestamp).toISOString(),
    }));

    const reviewQueue = [
      {
        id: 'REV-1042',
        user: 'admin@sentinel.soc',
        reason: 'Account takeover risk',
        score: 96,
        status: 'Manual review',
        signals: ['Credential stuffing', 'New ASN', 'Privileged role'],
      },
      {
        id: 'REV-1088',
        user: 'finance.diana@sentinel.soc',
        reason: 'Phishing exposure',
        score: 81,
        status: 'Suspend if repeated',
        signals: ['Lookalike URL', 'MFA fatigue', 'High-risk region'],
      },
      {
        id: 'REV-1120',
        user: 'api-key-prod-07',
        reason: 'API abuse pattern',
        score: 74,
        status: 'Rate-limit',
        signals: ['Burst requests', 'Scraping path', 'Token reuse'],
      },
    ];

    const auditTrail = [
      {
        id: 'AUD-4401',
        field: 'role',
        entity: 'dev.charlie@sentinel.soc',
        before: 'Developer',
        after: 'Repository Admin',
        actor: 'unknown-session',
        timestamp: iso(17),
      },
      {
        id: 'AUD-4402',
        field: 'mfa_status',
        entity: 'finance.diana@sentinel.soc',
        before: 'enabled',
        after: 'recovery pending',
        actor: 'helpdesk-console',
        timestamp: iso(21),
      },
      {
        id: 'AUD-4403',
        field: 'api_scope',
        entity: 'api-key-prod-07',
        before: 'read:orders',
        after: 'read:orders write:refunds',
        actor: 'service-account',
        timestamp: iso(35),
      },
    ];

    const ruleStats = [
      { name: 'Account takeover', hits: 42, risk: 94, category: 'Identity' },
      { name: 'Credential stuffing', hits: 38, risk: 91, category: 'Authentication' },
      { name: 'Bot detection', hits: 27, risk: 76, category: 'Automation' },
      { name: 'API protection', hits: 19, risk: 72, category: 'Product abuse' },
      { name: 'High-risk regions', hits: 11, risk: 63, category: 'Geo risk' },
      { name: 'Multi-accounting', hits: 8, risk: 58, category: 'Fraud' },
    ];

    set({
      events: timelineEvents,
      alerts,
      incidents,
      timelineEvents,
      userRisks,
      notifications,
      quarantinedDevices: ['LAPTOP-SALES-021'],
      reviewQueue,
      auditTrail,
      ruleStats,
      metrics: {
        totalIncidents: incidents.length,
        activeThreats: alerts.filter(alert => !alert.resolved).length,
        quarantinedDevices: 1,
        avgResponseTime: 1.2,
        totalLoginAttempts: 186,
        blockedLoginAttempts: 43,
      },
      simulationActive: false,
    });
  },

  clearData: () => set(initialState)
}));

// Helper logic for recommended response
function getMitigationRecommendation(type) {
  switch (type) {
    case 'phishing_attempt':
      return 'Block Sender Domain';
    case 'anomalous_login':
      return 'Require MFA';
    case 'ransomware_behavior':
      return 'Isolate Host';
    case 'ddos_activity':
      return 'Block Source IPs';
    case 'credential_stuffing':
      return 'Reset Passwords';
    default:
      return 'Investigate';
  }
}

export default useStore;
