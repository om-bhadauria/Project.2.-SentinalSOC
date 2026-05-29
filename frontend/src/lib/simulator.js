import useStore from '../store/useStore';

class SimulationEngine {
  constructor() {
    this.timer = null;
    this.intervalMs = 3000; // Fire an event every 3 seconds
    this.isRunning = false;

    // Data pools for generating realistic feeling fake data
    this.ips = ['192.168.1.5', '192.168.1.10', '10.0.0.45', '172.16.0.12', '45.33.22.11', '8.8.4.4', '108.99.23.4'];
    this.users = ['jdoe', 'asmith', 'sjohnson', 'bwayne', 'ckent', 'pparker'];
    this.systems = ['SRV-DB-01', 'WORK-LTP-44', 'DC-01', 'WEB-FE-02', 'MAIL-EXCH-01', 'VPN-GW-01'];
    this.locations = ['New York, US', 'London, UK', 'Tokyo, JP', 'Moscow, RU', 'Beijing, CN', 'Unknown IP'];
    
    // Weighted event types
    this.eventTypes = [
      { type: 'login_success', severity: 'low', weight: 40, desc: 'Successful login' },
      { type: 'login_failed', severity: 'medium', weight: 15, desc: 'Failed login attempt' },
      { type: 'phishing_attempt', severity: 'high', weight: 10, desc: 'URL sandbox detection' },
      { type: 'anomalous_login', severity: 'high', weight: 10, desc: 'Impossible travel detected' },
      { type: 'ransomware_behavior', severity: 'critical', weight: 5, desc: 'Mass file encryption detected' },
      { type: 'ddos_activity', severity: 'critical', weight: 5, desc: 'Volumetric traffic spike' },
      { type: 'privilege_escalation', severity: 'critical', weight: 5, desc: 'Unauthorized IAM role assumption' },
      { type: 'port_scan', severity: 'medium', weight: 10, desc: 'Sequential port probing' },
    ];
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    useStore.getState().setSimulationActive(true);
    
    // Inject a starting context event
    this._dispatch({
        type: 'simulation_started',
        severity: 'info',
        description: 'Automated threat simulation engine online'
    });

    this.timer = setInterval(() => {
      this._generateRandomEvent();
    }, this.intervalMs);
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.timer);
    useStore.getState().setSimulationActive(false);

    this._dispatch({
        type: 'simulation_stopped',
        severity: 'info',
        description: 'Automated threat simulation engine offline'
    });
  }

  toggle() {
      if (this.isRunning) {
          this.stop();
      } else {
          this.start();
      }
  }

  // Scripted deterministic sequence for demo purposes
  simulateAttackSequence() {
      // 1. Phishing Alert
      useStore.getState().setSimulationActive(true);
      
      this._dispatch({
          type: 'phishing_attempt',
          severity: 'high',
          description: 'Malicious payload downloaded via email link',
          target_user: 'asmith',
          system: 'WORK-LTP-44',
          source_ip: '45.33.22.11',
          location: 'Unknown IP'
      });

      // 2. Suspicious Login
      setTimeout(() => {
        this._dispatch({
            type: 'anomalous_login',
            severity: 'critical',
            description: 'Impossible travel: Login from Beijing 10 min after London',
            target_user: 'asmith',
            system: 'VPN-GW-01',
            source_ip: '108.99.23.4',
            location: 'Beijing, CN'
        });
      }, 2500);

      // 3. Ransomware Behavior (Mass encryption)
      setTimeout(() => {
        this._dispatch({
            type: 'ransomware_behavior',
            severity: 'critical',
            description: 'Mass file encryption detected on shared drive',
            target_user: 'asmith',
            system: 'SRV-DB-01',
            source_ip: '108.99.23.4',
            location: 'Internal'
        });
        useStore.getState().setSimulationActive(false);
      }, 5500);
  }

  // Pick a random item based on weights
  _pickWeighted(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let randomNum = Math.random() * totalWeight;
    for (const item of items) {
      if (randomNum < item.weight) return item;
      randomNum -= item.weight;
    }
    return items[0];
  }

  _getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  _generateRandomEvent() {
    const evTemplate = this._pickWeighted(this.eventTypes);
    
    // Sometimes jitter the severity for realism (e.g., highly suspicious login)
    let severity = evTemplate.severity;
    if (severity === 'medium' && Math.random() > 0.8) severity = 'high';

    const event = {
      id: crypto.randomUUID(),
      type: evTemplate.type,
      severity: severity,
      timestamp: new Date().toISOString(),
      source_ip: this._getRandomElement(this.ips),
      target_user: this._getRandomElement(this.users),
      system: this._getRandomElement(this.systems),
      location: this._getRandomElement(this.locations),
      description: evTemplate.desc
    };

    this._dispatch(event);
  }

  _dispatch(event) {
    // Ensure standard fields
    const baseEvent = {
        id: crypto.randomUUID(),
        target_user: 'system',
        system: Object.keys(useStore.getState().quarantinedDevices || []).length > 0 ? 'Firewall' : 'Core Router',
        location: 'Local',
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
    };

    useStore.getState().addEvent(baseEvent);
  }
}

export const simulator = new SimulationEngine();
