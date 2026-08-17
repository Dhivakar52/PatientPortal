import React, { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { LabOrder } from '@/types/lab.types'
import { useLabBilling } from '@/context/LabBillingContext'
import { StandardModuleTable } from '@/common/StandardModuleTable'
import { Badge } from '@/components/ui/badge'
import { Status } from '@/common/Status'
import { ActionMenu } from '@/common/ActionMenu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, Printer, Download, CheckCircle2 } from 'lucide-react'

export const LabReportsScreen: React.FC = () => {
  const { labOrders } = useLabBilling()

  // Verified reports
  const verifiedReports = labOrders.filter((o) => o.resultStatus === 'Verified')
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handlePreview = (order: LabOrder) => {
    setSelectedOrder(order)
    setIsPreviewOpen(true)
  }

  const columns: ColumnDef<LabOrder>[] = [
    {
      id: 'reportId',
      header: 'Report ID',
      cell: ({ row }) => <span className="font-mono text-xs font-semibold text-[#2952CC]">REP-{row.original.orderId}</span>,
    },
    {
      accessorKey: 'orderId',
      header: 'Order ID',
      cell: ({ row }) => <span className="font-semibold text-blue-600">{row.original.orderId}</span>,
    },
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">{row.original.patientName}</div>
          <div className="text-[11px] text-slate-500">{row.original.patientId}</div>
        </div>
      ),
    },
    {
      accessorKey: 'tests',
      header: 'Test',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-xs font-medium">
          {row.original.tests.join(', ')}
        </div>
      ),
    },
    {
      accessorKey: 'doctor',
      header: 'Doctor',
      cell: ({ row }) => <span className="text-xs">{row.original.doctor}</span>,
    },
    {
      accessorKey: 'verifiedDate',
      header: 'Report Date',
      cell: ({ row }) => <span className="text-xs text-slate-500">{row.original.verifiedDate || row.original.orderDate}</span>,
    },
    {
      accessorKey: 'resultStatus',
      header: 'Verification Status',
      cell: () => <Status status="completed" showLabel={true} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ActionMenu
          item={row.original}
          onView={handlePreview}
          onPrint={handlePreview}
        />
      ),
    },
  ]

  return (
    <div>
      <StandardModuleTable
        title="Lab Reports Archive"
        subtitle="Search and print released verified patient laboratory diagnostic reports"
        icon={FileText}
        columns={columns}
        data={verifiedReports}
        searchPlaceholder="Search Patient Name or Report ID..."
        searchField={(item) => `${item.patientName} ${item.orderId}`}
      />

      {selectedOrder && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Verified Diagnostic Report
              </DialogTitle>
            </DialogHeader>

            <div className="border p-6 rounded bg-white dark:bg-slate-900 space-y-4">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h3 className="font-bold text-lg text-blue-950 dark:text-blue-300">SRM ENTERPRISE HOSPITAL</h3>
                  <p className="text-xs text-slate-500">Department of Pathology &amp; Laboratory Medicine</p>
                </div>
                <div className="text-right text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">REP-{selectedOrder.orderId}</div>
                  <div className="text-slate-500">Date: {selectedOrder.verifiedDate || selectedOrder.orderDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded">
                <div><b>Patient Name:</b> {selectedOrder.patientName}</div>
                <div><b>Patient ID:</b> {selectedOrder.patientId}</div>
                <div><b>Age / Gender:</b> {selectedOrder.ageGender}</div>
                <div><b>Referred By:</b> {selectedOrder.doctor}</div>
              </div>

              <div className="space-y-2">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-100 dark:bg-slate-800">
                      <th className="p-2">Parameter</th>
                      <th className="p-2">Result</th>
                      <th className="p-2">Unit</th>
                      <th className="p-2">Reference Range</th>
                      <th className="p-2">Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.parameters?.map((p) => (
                      <tr key={p.id} className="border-b">
                        <td className="p-2 font-medium">{p.parameter}</td>
                        <td className="p-2 font-bold">{p.result}</td>
                        <td className="p-2">{p.unit}</td>
                        <td className="p-2 text-slate-500">{p.referenceRange}</td>
                        <td className="p-2">
                          <Badge variant={p.flag === 'Normal' ? 'outline' : 'destructive'}>{p.flag}</Badge>
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">No parameters attached.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between text-xs text-slate-500 pt-4 border-t">
                <div>Lab Technician: <b>{selectedOrder.technician || 'Ramesh'}</b></div>
                <div>Verified By: <b>{selectedOrder.verifiedBy || 'Dr. Hema (Pathologist)'}</b></div>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" onClick={() => window.print()} className="gap-1">
                <Printer className="w-4 h-4" /> Print
              </Button>
              <Button size="sm" variant="secondary" onClick={() => alert('Downloading PDF Report...')} className="gap-1">
                <Download className="w-4 h-4" /> Download PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
