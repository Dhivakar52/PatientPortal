import React, { useState, useEffect } from 'react'
import type { LabOrder, LabResultParameter, ResultFlag } from '@/types/lab.types'
import { useLabBilling } from '@/context/LabBillingContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FieldLabel, TextField, SelectField } from '@/components/FormPrimitives'
import { FileText, ArrowLeft, Save, Send, Plus, Trash2 } from 'lucide-react'

interface ResultEntryScreenProps {
  initialOrder?: LabOrder | null
  onBack?: () => void
}

export const ResultEntryScreen: React.FC<ResultEntryScreenProps> = ({
  initialOrder,
  onBack,
}) => {
  const { labOrders, saveLabResult } = useLabBilling()

  // Find lab orders eligible for result entry
  const eligibleOrders = labOrders.filter((o) => o.sampleStatus === 'In Lab' || o.resultStatus === 'Draft')
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    initialOrder ? initialOrder.orderId : eligibleOrders[0]?.orderId || ''
  )

  const currentOrder = labOrders.find((o) => o.orderId === selectedOrderId) || initialOrder

  // Parameters State
  const [parameters, setParameters] = useState<LabResultParameter[]>([])

  useEffect(() => {
    if (currentOrder && currentOrder.parameters && currentOrder.parameters.length > 0) {
      setParameters(currentOrder.parameters)
    } else if (currentOrder) {
      // Default parameters based on requested tests
      const derived: LabResultParameter[] = currentOrder.tests.map((t, idx) => ({
        id: `p-${idx + 1}`,
        parameter: t.includes('CBC') ? 'Hemoglobin' : t.includes('LFT') ? 'Serum Bilirubin Total' : `${t} Value`,
        result: '',
        unit: t.includes('CBC') ? 'g/dL' : 'mg/dL',
        referenceRange: t.includes('CBC') ? '13.0 - 17.0' : '0.2 - 1.2',
        flag: 'Normal',
      }))
      setParameters(derived)
    }
  }, [currentOrder])

  const handleAddParam = () => {
    setParameters((prev) => [
      ...prev,
      {
        id: `param-${Date.now()}`,
        parameter: '',
        result: '',
        unit: 'mg/dL',
        referenceRange: '0 - 100',
        flag: 'Normal',
      },
    ])
  }

  const handleRemoveParam = (id: string) => {
    setParameters((prev) => prev.filter((p) => p.id !== id))
  }

  const handleParamChange = (id: string, field: keyof LabResultParameter, value: string) => {
    setParameters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }

  const handleSaveDraft = () => {
    if (!currentOrder) return
    saveLabResult(currentOrder.orderId, parameters, false)
    if (onBack) onBack()
  }

  const handleSubmitResult = () => {
    if (!currentOrder) return
    saveLabResult(currentOrder.orderId, parameters, true)
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
              <FileText className="w-6 h-6 text-blue-600" />
              Laboratory Result Entry
            </h2>
            <p className="text-xs text-slate-500">Record quantitative lab test parameter values and flags</p>
          </div>
        </div>
      </div>

      {/* Select Order */}
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-md">
            <FieldLabel required>Select Worklist Order</FieldLabel>
            <SelectField
              options={eligibleOrders.map((o) => o.orderId)}
              value={selectedOrderId}
              onChange={(val) => setSelectedOrderId(val)}
              placeholder="Choose Order ID"
            />
          </div>
        </CardContent>
      </Card>

      {currentOrder ? (
        <div className="space-y-6">
          {/* Patient & Test Header Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Section */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Patient Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-500">Patient ID:</span> <b>{currentOrder.patientId}</b></div>
                <div><span className="text-slate-500">Name:</span> <b>{currentOrder.patientName}</b></div>
                <div><span className="text-slate-500">Age / Gender:</span> <b>{currentOrder.ageGender}</b></div>
                <div><span className="text-slate-500">Visit ID:</span> <b>{currentOrder.visitId}</b></div>
                <div><span className="text-slate-500">Attending Doctor:</span> <b>{currentOrder.doctor}</b></div>
                <div><span className="text-slate-500">Order ID:</span> <b className="text-blue-600">{currentOrder.orderId}</b></div>
              </CardContent>
            </Card>

            {/* Test Section */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Specimen &amp; Test Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-500">Test Requisition:</span> <b className="text-slate-900 dark:text-slate-100">{currentOrder.tests.join(', ')}</b></div>
                <div><span className="text-slate-500">Sample ID:</span> <b className="font-mono text-[#2952CC]">{currentOrder.sampleId || 'SMP-8839'}</b></div>
                <div><span className="text-slate-500">Sample Type:</span> <b>{currentOrder.sampleType || 'Whole Blood'}</b></div>
                <div><span className="text-slate-500">Container:</span> <b>{currentOrder.container || 'Purple Top (EDTA)'}</b></div>
                <div><span className="text-slate-500">Collection Date:</span> <b>{currentOrder.collectionDate || 'Today'}</b></div>
                <div><span className="text-slate-500">Priority:</span> <Badge variant="secondary">{currentOrder.priority}</Badge></div>
              </CardContent>
            </Card>
          </div>

          {/* Result Entry Parameters Table */}
          <Card>
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">Parameter Test Results</CardTitle>
              <Button size="sm" variant="outline" onClick={handleAddParam} className="h-8 gap-1 text-xs">
                <Plus className="w-3.5 h-3.5" /> Add Parameter
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <th className="p-2.5 w-1/4">Parameter Name</th>
                      <th className="p-2.5 w-1/6">Result Value</th>
                      <th className="p-2.5 w-1/6">Unit</th>
                      <th className="p-2.5 w-1/5">Reference Range</th>
                      <th className="p-2.5 w-1/6">Flag</th>
                      <th className="p-2.5 w-1/6">Remarks</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parameters.map((param) => (
                      <tr key={param.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        <td className="p-2">
                          <TextField
                            value={param.parameter}
                            onChange={(val) => handleParamChange(param.id, 'parameter', val)}
                            placeholder="Parameter Name"
                          />
                        </td>
                        <td className="p-2">
                          <TextField
                            value={param.result}
                            onChange={(val) => handleParamChange(param.id, 'result', val)}
                            placeholder="Result Value"
                          />
                        </td>
                        <td className="p-2">
                          <TextField
                            value={param.unit}
                            onChange={(val) => handleParamChange(param.id, 'unit', val)}
                            placeholder="Unit"
                          />
                        </td>
                        <td className="p-2">
                          <TextField
                            value={param.referenceRange}
                            onChange={(val) => handleParamChange(param.id, 'referenceRange', val)}
                            placeholder="Ref Range"
                          />
                        </td>
                        <td className="p-2">
                          <SelectField
                            options={['Normal', 'High', 'Low', 'Critical']}
                            value={param.flag}
                            onChange={(val) => handleParamChange(param.id, 'flag', val as ResultFlag)}
                          />
                        </td>
                        <td className="p-2">
                          <TextField
                            value={param.remarks || ''}
                            onChange={(val) => handleParamChange(param.id, 'remarks', val)}
                            placeholder="Remarks"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-700"
                            onClick={() => handleRemoveParam(param.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Cancel
              </Button>
            )}

            <Button variant="secondary" onClick={handleSaveDraft} className="gap-1 cursor-pointer">
              <Save className="w-4 h-4" /> Save Draft
            </Button>

            <Button onClick={handleSubmitResult} className="bg-blue-600 hover:bg-blue-700 text-white gap-1 cursor-pointer">
              <Send className="w-4 h-4" /> Submit Result for Verification
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center text-slate-500 text-xs">
          No lab orders available for result entry.
        </Card>
      )}
    </div>
  )
}
