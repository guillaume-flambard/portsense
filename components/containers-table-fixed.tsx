'use client'

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { useContainers } from '@/hooks/use-containers-query'
import { useRealtimeSync } from '@/hooks/use-realtime-sync'
import { containers as Container } from '@/lib/generated/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  MapPin,
  Clock,
  AlertTriangle,
  Package,
  RefreshCw
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Fixed version without flexRender to test the issue
export function ContainersTableFixed() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  
  const { data: containers = [], isLoading, error, refetch, isRefetching } = useContainers()
  const { isConnected } = useRealtimeSync()

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'at destination':
        return 'bg-green-100 text-green-800'
      case 'in transit':
        return 'bg-blue-100 text-blue-800'
      case 'delayed':
        return 'bg-red-100 text-red-800'
      case 'loading':
      case 'unloading':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: string | null) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Simplified columns without flexRender
  const columns: ColumnDef<Container>[] = [
    {
      accessorKey: 'container_id',
      header: 'Container ID',
    },
    {
      accessorKey: 'status',
      header: 'Status',
    },
    {
      accessorKey: 'current_location',
      header: 'Location',
    },
    {
      accessorKey: 'delay_hours',
      header: 'Delay',
    },
    {
      accessorKey: 'risk_level',
      header: 'Risk',
    },
    {
      accessorKey: 'last_updated',
      header: 'Last Updated',
    },
  ]

  const table = useReactTable({
    data: containers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg font-semibold text-red-600 mb-2">
          Failed to load containers
        </p>
        <p className="text-muted-foreground mb-4">
          {error.message}
        </p>
        <Button onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Containers (Fixed Table)</h3>
          <p className="text-sm text-muted-foreground">
            TanStack Table without flexRender to test compatibility
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? 'Live' : 'Offline'}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search containers..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="pl-8"
          />
        </div>
      </div>

      {/* Simple Table without flexRender */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Package className="mr-2 h-3 w-3 inline" />
                Container ID
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <MapPin className="mr-2 h-3 w-3 inline" />
                Location
              </TableHead>
              <TableHead>
                <Clock className="mr-2 h-3 w-3 inline" />
                Delay
              </TableHead>
              <TableHead>
                <AlertTriangle className="mr-2 h-3 w-3 inline" />
                Risk
              </TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading containers...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {row.original.container_id}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(row.original.status)}>
                      {row.original.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {row.original.current_location || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <div className={row.original.delay_hours > 0 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                      {row.original.delay_hours > 0 ? `${row.original.delay_hours}h` : 'On time'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRiskColor(row.original.risk_level)}>
                      {row.original.risk_level || 'Low'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {row.original.last_updated ? formatDistanceToNow(new Date(row.original.last_updated)) + ' ago' : 'Unknown'}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No containers found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of{' '}
          {table.getCoreRowModel().rows.length} container(s)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}