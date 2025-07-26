'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AddContainerButton() {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [containerId, setContainerId] = useState('')
  const [carrier, setCarrier] = useState('')
  const [originPort, setOriginPort] = useState('')
  const [destinationPort, setDestinationPort] = useState('')
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/containers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          container_id: containerId,
          carrier,
          origin_port: originPort,
          destination_port: destinationPort,
        }),
      })

      if (response.ok) {
        setShowModal(false)
        setContainerId('')
        setCarrier('')
        setOriginPort('')
        setDestinationPort('')
        router.refresh()
      } else {
        console.error('Failed to add container')
      }
    } catch (error) {
      console.error('Error adding container:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
      >
        + Add Container
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Track New Container</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Container ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g., MSCU1234567"
                  value={containerId}
                  onChange={(e) => setContainerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carrier
                </label>
                <input
                  type="text"
                  placeholder="e.g., Maersk"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origin Port
                </label>
                <input
                  type="text"
                  placeholder="e.g., Port of Shanghai"
                  value={originPort}
                  onChange={(e) => setOriginPort(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination Port
                </label>
                <input
                  type="text"
                  placeholder="e.g., Port of Rotterdam"
                  value={destinationPort}
                  onChange={(e) => setDestinationPort(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Container'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}