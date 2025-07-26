export interface MarineAPIResponse {
  container_id: string
  vessel: {
    name: string
    imo: string
    call_sign: string
  }
  location: {
    latitude: number
    longitude: number
    port: string
    country: string
  }
  status: string
  eta: string
  last_port: string
  next_port: string
  voyage: string
}

export class MarineTrackingAPI {
  // Mock implementation - in production, integrate with real APIs like:
  // - MarineTraffic API
  // - Vesselfinder API
  // - AIS data providers
  
  static async trackContainer(containerId: string): Promise<MarineAPIResponse | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock data based on container ID
    const mockData: MarineAPIResponse = {
      container_id: containerId,
      vessel: {
        name: "MAERSK CHICAGO",
        imo: "9778286",
        call_sign: "ELYA4"
      },
      location: {
        latitude: 1.2966,
        longitude: 103.8558,
        port: "Port of Singapore",
        country: "Singapore"
      },
      status: "In Transit",
      eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      last_port: "Port Klang",
      next_port: "Rotterdam",
      voyage: "422W"
    }

    // Simulate some containers not being found
    if (containerId.includes('404')) {
      return null
    }

    // Simulate delays for some containers
    if (containerId.includes('DELAY')) {
      mockData.status = "Delayed"
      mockData.eta = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    return mockData
  }

  static async getPortCongestion(portName: string): Promise<{
    port: string
    congestion_level: 'Low' | 'Medium' | 'High'
    average_delay_hours: number
    active_vessels: number
  }> {
    return {
      port: portName,
      congestion_level: 'Medium',
      average_delay_hours: 18,
      active_vessels: 127
    }
  }
}