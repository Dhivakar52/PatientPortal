import React, { useState } from 'react'
import type { LabOrder } from '@/types/lab.types'
import { useLabBilling } from '@/context/LabBillingContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FieldLabel, TextField, SelectField } from '@/components/FormPrimitives'
import { BarcodeGenerator } from '@/components/BarcodeGenerator'
import { DeleteConfirmationDialog } from '@/common/DeleteConfirmationDialog'
import { TestTube, FlaskConical, CheckCircle2, XCircle, RefreshCw, ArrowLeft } from 'lucide-react'

interface SampleCollectionScreenProps {
  initialOrder?: LabOrder | null
  onBack?: () => void
}

export const SampleCollectionScreen: React.FC<SampleCollectionScreenProps> = ({
  initialOrder,
  onBack,
}) => {
  const { labOrders, updateSampleStatus } = useLabBilling()

  // Select order if not provided directly
  const pendingOrders = labOrders.filter((o) => o.sampleStatus !== 'In Lab')
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    initialOrder ? initialOrder.orderId : pendingOrders[0]?.orderId || ''
  )

  const currentOrder = labOrders.find((o) => o.orderId === selectedOrderId) || initialOrder

  // Form State
  const [sampleId, setSampleId] = useState(`SMP-${Math.floor(1000 + Math.random() * 9000)}`)
  const [container, setContainer] = useState('Purple Top (EDTA)')
  const [collectedBy, setCollectedBy] = useState('Lab Tech John')
  const [collectionTime, setCollectionTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

  // Dialog State
  const [isConfirmCollectOpen, setIsConfirmCollectOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [rejectReason] = useState('Insufficient sample volume / hemolyzed sample')

  const handleCollect = () => {
    if (!currentOrder) return
    updateSampleStatus(currentOrder.orderId, 'In Lab', {
      sampleId,
      container,
      collectedBy,
      collectionDate: new Date().toISOString().split('T')[0],
      collectionTime,
    })
    setIsConfirmCollectOpen(false)
    if (onBack) onBack()
  }

  const handleReject = () => {
    if (!currentOrder) return
    updateSampleStatus(currentOrder.orderId, 'Rejected', {
      rejectionReason: rejectReason || 'Insufficient sample volume / hemolyzed sample',
    })
    setIsRejectOpen(false)
    if (onBack) onBack()
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-blue-600" />
              Sample Collection &amp; Barcode Accessioning
            </h2>
            <p className="text-xs text-slate-500">Collect, verify and generate barcode for patient specimens</p>
          </div>
        </div>
      </div>

      {/* Select Order Dropdown */}
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-md">
            <FieldLabel required>Select Pending Order for Collection</FieldLabel>
            <SelectField
              options={pendingOrders.map((o) => o.orderId)}
              value={selectedOrderId}
              onChange={(val) => setSelectedOrderId(val)}
              placeholder="Choose Order ID"
            />
          </div>
        </CardContent>
      </Card>

      {currentOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Patient & Test Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Information Card */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-blue-600" /> Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Patient ID</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{currentOrder.patientId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Patient Name</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{currentOrder.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Age / Gender</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{currentOrder.ageGender}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Mobile</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{currentOrder.mobile || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Visit ID</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{currentOrder.visitId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">OP / IP Number</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{currentOrder.opIpNumber || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Test Information Card */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-blue-600" /> Test &amp; Specimen Requisition
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-500 block">Order ID</span>
                    <span className="font-semibold text-blue-600">{currentOrder.orderId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Priority</span>
                    <Badge variant={currentOrder.priority === 'STAT' ? 'destructive' : 'secondary'}>
                      {currentOrder.priority}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Doctor &amp; Dept</span>
                    <span className="font-semibold">{currentOrder.doctor} ({currentOrder.department})</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <span className="text-slate-500 block mb-1">Ordered Tests</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentOrder.tests.map((t, idx) => (
                      <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collection Information Form */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold">Specimen Collection Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Sample ID / Accession No</FieldLabel>
                  <TextField value={sampleId} onChange={setSampleId} />
                </div>

                <div>
                  <FieldLabel required>Container Type</FieldLabel>
                  <SelectField
                    options={['Purple Top (EDTA)', 'Red Top (Serum)', 'Yellow Top (SST)', 'Grey Top (Fluoride)', 'Sterile Container']}
                    value={container}
                    onChange={setContainer}
                  />
                </div>

                <div>
                  <FieldLabel required>Collected By</FieldLabel>
                  <TextField value={collectedBy} onChange={setCollectedBy} />
                </div>

                <div>
                  <FieldLabel required>Collection Time</FieldLabel>
                  <TextField value={collectionTime} onChange={setCollectionTime} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 3: Barcode & Actions */}
          <div className="space-y-6">
            <Card className="text-center">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-sm font-bold">Sample Barcode Tag</CardTitle>
                <CardDescription className="text-xs">Generated for specimen vial</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col items-center justify-center min-h-[160px]">
                <BarcodeGenerator value={sampleId} />
                <p className="text-[11px] text-slate-500 mt-2 font-mono">{currentOrder.patientName} | {currentOrder.orderId}</p>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-sm font-bold">Collection Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  onClick={() => setIsConfirmCollectOpen(true)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Collected &amp; Send to Lab
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 cursor-pointer"
                  onClick={() => {
                    setSampleId(`SMP-${Math.floor(1000 + Math.random() * 9000)}`)
                    setIsConfirmCollectOpen(true)
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Recollect Sample
                </Button>

                <Button
                  variant="destructive"
                  className="w-full cursor-pointer"
                  onClick={() => setIsRejectOpen(true)}
                >
                  <XCircle className="w-4 h-4 mr-2" /> Reject Sample
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center text-slate-500 text-xs">
          No pending orders selected for sample collection.
        </Card>
      )}

      {/* Confirmation Dialogs */}
      <DeleteConfirmationDialog
        isOpen={isConfirmCollectOpen}
        onOpenChange={setIsConfirmCollectOpen}
        onConfirm={handleCollect}
        title="Confirm Sample Collection"
        description="Are you sure you want to mark this specimen as collected and transfer it to the Laboratory?"
        itemName={sampleId}
        confirmLabel="Confirm Collection"
      />

      <DeleteConfirmationDialog
        isOpen={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        onConfirm={handleReject}
        title="Reject Specimen"
        description="Are you sure you want to reject this sample requisition? This will require re-ordering or re-collection."
        itemName={currentOrder?.orderId}
        confirmLabel="Reject Sample"
      />
    </div>
  )
}
