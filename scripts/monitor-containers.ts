import { MonitoringService } from '@/lib/services/monitoring-service'

async function main() {
  const monitoringService = new MonitoringService()
  
  try {
    await monitoringService.runMonitoringCycle()
    process.exit(0)
  } catch (error) {
    console.error('Monitoring script failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { main as monitorContainers }