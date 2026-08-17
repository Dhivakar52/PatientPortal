import React, { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { TestMasterItem } from '@/types/lab.types'
import { useLabBilling } from '@/context/LabBillingContext'
import { StandardModuleTable } from '@/common/StandardModuleTable'
import { Badge } from '@/components/ui/badge'
import { Status } from '@/common/Status'
import { ActionMenu } from '@/common/ActionMenu'
import CustomPanel from '@/common/CustomPanel'
import { FieldLabel, TextField, SelectField } from '@/components/FormPrimitives'
import { FlaskConical } from 'lucide-react'

export const TestMasterScreen: React.FC = () => {
  const { testMaster, addTestMasterItem, updateTestMasterItem } = useLabBilling()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TestMasterItem | null>(null)

  // Form State
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Biochemistry')
  const [sampleType, setSampleType] = useState('Serum')
  const [unit, setUnit] = useState('mg/dL')
  const [referenceRange, setReferenceRange] = useState('0 - 100')
  const [price, setPrice] = useState('500')
  const [turnaroundTime, setTurnaroundTime] = useState('4 hours')

  const handleOpenAdd = () => {
    setEditingItem(null)
    setCode(`LAB-${Math.floor(100 + Math.random() * 900)}`)
    setName('')
    setCategory('Biochemistry')
    setSampleType('Serum')
    setUnit('mg/dL')
    setReferenceRange('0 - 100')
    setPrice('500')
    setTurnaroundTime('4 hours')
    setIsAddModalOpen(true)
  }

  const handleOpenEdit = (item: TestMasterItem) => {
    setEditingItem(item)
    setCode(item.code)
    setName(item.name)
    setCategory(item.category)
    setSampleType(item.sampleType)
    setUnit(item.unit)
    setReferenceRange(item.referenceRange)
    setPrice(String(item.price))
    setTurnaroundTime(item.turnaroundTime)
    setIsAddModalOpen(true)
  }

  const handleSave = () => {
    if (!name.trim()) return
    if (editingItem) {
      updateTestMasterItem(editingItem.id, {
        code,
        name,
        category,
        sampleType,
        unit,
        referenceRange,
        price: Number(price) || 0,
        turnaroundTime,
      })
    } else {
      addTestMasterItem({
        code,
        name,
        category,
        sampleType,
        unit,
        referenceRange,
        price: Number(price) || 0,
        turnaroundTime,
        status: 'Active',
      })
    }
    setIsAddModalOpen(false)
  }

  const handleToggleStatus = (item: TestMasterItem) => {
    updateTestMasterItem(item.id, {
      status: item.status === 'Active' ? 'Inactive' : 'Active',
    })
  }

  const columns: ColumnDef<TestMasterItem>[] = [
    {
      accessorKey: 'code',
      header: 'Test Code',
      cell: ({ row }) => <span className="font-mono text-xs font-semibold text-blue-600">{row.original.code}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Test Name',
      cell: ({ row }) => <span className="font-medium text-slate-900 dark:text-slate-100">{row.original.name}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <Badge variant="secondary">{row.original.category}</Badge>,
    },
    {
      accessorKey: 'sampleType',
      header: 'Sample Type',
      cell: ({ row }) => <span className="text-xs text-slate-600 dark:text-slate-400">{row.original.sampleType}</span>,
    },
    {
      accessorKey: 'unit',
      header: 'Unit',
      cell: ({ row }) => <span className="text-xs">{row.original.unit}</span>,
    },
    {
      accessorKey: 'referenceRange',
      header: 'Reference Range',
      cell: ({ row }) => <span className="text-xs text-slate-500">{row.original.referenceRange}</span>,
    },
    {
      accessorKey: 'price',
      header: 'Price (₹)',
      cell: ({ row }) => <span className="font-bold text-slate-900 dark:text-slate-100">₹{row.original.price}</span>,
    },
    {
      accessorKey: 'turnaroundTime',
      header: 'Turnaround Time',
      cell: ({ row }) => <span className="text-xs text-slate-500">{row.original.turnaroundTime}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Status status={row.original.status === 'Active' ? 'active' : 'cancelled'} showLabel={true} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ActionMenu
          item={row.original}
          onEdit={handleOpenEdit}
          onDeactivate={handleToggleStatus}
        />
      ),
    },
  ]

  return (
    <div>
      <StandardModuleTable
        title="Test Master Catalogue"
        subtitle="Manage hospital diagnostic test specifications, pricing, and reference ranges"
        icon={FlaskConical}
        columns={columns}
        data={testMaster}
        searchPlaceholder="Search Test Code or Name..."
        searchField={(item) => `${item.code} ${item.name} ${item.category}`}
        onAdd={handleOpenAdd}
      />

      {/* Add / Edit Test CustomPanel Side Drawer */}
      <CustomPanel
        isOpen={isAddModalOpen}
        title={editingItem ? 'Edit Test Master Item' : 'Add New Laboratory Test'}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
        saveLabel={editingItem ? 'Save Changes' : 'Create Test'}
        width="540px"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Test Code</FieldLabel>
              <TextField value={code} onChange={setCode} />
            </div>
            <div>
              <FieldLabel required>Category</FieldLabel>
              <SelectField
                options={['Biochemistry', 'Hematology', 'Endocrinology', 'Pathology', 'Microbiology']}
                value={category}
                onChange={setCategory}
              />
            </div>
          </div>

          <div>
            <FieldLabel required>Test Name</FieldLabel>
            <TextField value={name} onChange={setName} placeholder="e.g. Thyroid Profile" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Sample Type</FieldLabel>
              <SelectField
                options={['Serum', 'Whole Blood (EDTA)', 'Urine', 'Plasma', 'Sputum']}
                value={sampleType}
                onChange={setSampleType}
              />
            </div>
            <div>
              <FieldLabel required>Unit of Measurement</FieldLabel>
              <TextField value={unit} onChange={setUnit} placeholder="e.g. mg/dL" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Reference Range</FieldLabel>
              <TextField value={referenceRange} onChange={setReferenceRange} placeholder="e.g. 0.6 - 1.2" />
            </div>
            <div>
              <FieldLabel required>Price (₹)</FieldLabel>
              <TextField value={price} onChange={setPrice} placeholder="500" />
            </div>
          </div>

          <div>
            <FieldLabel required>Turnaround Time</FieldLabel>
            <TextField value={turnaroundTime} onChange={setTurnaroundTime} placeholder="e.g. 4 hours" />
          </div>
        </div>
      </CustomPanel>
    </div>
  )
}
