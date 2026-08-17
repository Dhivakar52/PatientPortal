import React, { createContext, useContext, useState, useEffect } from 'react'
import type { LabOrder, TestMasterItem, LabResultParameter, SampleStatus, ResultStatus } from '@/types/lab.types'
import type { ServiceMasterItem, OPBill, OPPayment, OPRefund, IPAccount, InterimBill, FinalIPBill, PaymentMode, IPChargeItem } from '@/types/billing.types'
import { INITIAL_TEST_MASTER, INITIAL_LAB_ORDERS } from '@/data/mockLabData'
import { INITIAL_SERVICE_MASTER, INITIAL_OP_BILLS, INITIAL_IP_ACCOUNTS } from '@/data/mockBillingData'
import { toast } from '@/components/ui/toast'

interface LabBillingContextType {
  // Lab State & Actions
  labOrders: LabOrder[]
  testMaster: TestMasterItem[]
  updateSampleStatus: (orderId: string, status: SampleStatus, details?: Partial<LabOrder>) => void
  saveLabResult: (orderId: string, parameters: LabResultParameter[], isSubmit?: boolean) => void
  verifyLabResult: (orderId: string, verifiedBy: string, isReject?: boolean, reason?: string) => void
  addTestMasterItem: (item: Omit<TestMasterItem, 'id'>) => void
  updateTestMasterItem: (id: string, updates: Partial<TestMasterItem>) => void

  // OP Billing State & Actions
  serviceMaster: ServiceMasterItem[]
  opBills: OPBill[]
  opPayments: OPPayment[]
  opRefunds: OPRefund[]
  createOPBill: (billData: Omit<OPBill, 'id' | 'billNo' | 'billDate'>) => OPBill
  addOPPayment: (billNo: string, amount: number, mode: PaymentMode, ref: string, remarks?: string) => boolean
  addOPRefund: (billNo: string, amount: number, mode: PaymentMode, reason: string, remarks?: string) => boolean
  cancelOPBill: (billNo: string, reason: string) => boolean

  // IP Billing State & Actions
  ipAccounts: IPAccount[]
  interimBills: InterimBill[]
  finalIpBills: FinalIPBill[]
  addIPCharge: (ipNo: string, charge: Omit<IPChargeItem, 'id' | 'date'>) => void
  generateInterimBill: (ipNo: string) => InterimBill | null
  generateFinalIPBill: (ipNo: string) => FinalIPBill | null
  addIPPayment: (ipNo: string, amount: number, mode: PaymentMode, ref: string, remarks?: string) => boolean
  addIPRefund: (ipNo: string, amount: number, mode: PaymentMode, reason: string, remarks?: string) => boolean
}

const LabBillingContext = createContext<LabBillingContextType | undefined>(undefined)

export const LabBillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local Storage initialized states
  const [testMaster, setTestMaster] = useState<TestMasterItem[]>(() => {
    try {
      const saved = localStorage.getItem('hms_test_master')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      return INITIAL_TEST_MASTER
    } catch { return INITIAL_TEST_MASTER }
  })

  const [labOrders, setLabOrders] = useState<LabOrder[]>(() => {
    try {
      const saved = localStorage.getItem('hms_lab_orders')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      return INITIAL_LAB_ORDERS
    } catch { return INITIAL_LAB_ORDERS }
  })

  const [serviceMaster] = useState<ServiceMasterItem[]>(INITIAL_SERVICE_MASTER)

  const [opBills, setOpBills] = useState<OPBill[]>(() => {
    try {
      const saved = localStorage.getItem('hms_op_bills')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      return INITIAL_OP_BILLS
    } catch { return INITIAL_OP_BILLS }
  })

  const [opPayments, setOpPayments] = useState<OPPayment[]>([])
  const [opRefunds, setOpRefunds] = useState<OPRefund[]>([])

  const [ipAccounts, setIpAccounts] = useState<IPAccount[]>(() => {
    try {
      const saved = localStorage.getItem('hms_ip_accounts')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      return INITIAL_IP_ACCOUNTS
    } catch { return INITIAL_IP_ACCOUNTS }
  })

  const [interimBills, setInterimBills] = useState<InterimBill[]>([])
  const [finalIpBills, setFinalIpBills] = useState<FinalIPBill[]>([])

  // Persistence
  useEffect(() => {
    try { localStorage.setItem('hms_lab_orders', JSON.stringify(labOrders)) } catch (e) { console.error(e) }
  }, [labOrders])

  useEffect(() => {
    try { localStorage.setItem('hms_test_master', JSON.stringify(testMaster)) } catch (e) { console.error(e) }
  }, [testMaster])

  useEffect(() => {
    try { localStorage.setItem('hms_op_bills', JSON.stringify(opBills)) } catch (e) { console.error(e) }
  }, [opBills])

  useEffect(() => {
    try { localStorage.setItem('hms_ip_accounts', JSON.stringify(ipAccounts)) } catch (e) { console.error(e) }
  }, [ipAccounts])

  // --- LAB ACTIONS ---
  const updateSampleStatus = (orderId: string, status: SampleStatus, details?: Partial<LabOrder>) => {
    setLabOrders((prev) =>
      prev.map((ord) => {
        if (ord.orderId === orderId || ord.id === orderId) {
          return {
            ...ord,
            sampleStatus: status,
            ...details,
          }
        }
        return ord
      })
    )
    toast.success(`Sample status updated to ${status}`)
  }

  const saveLabResult = (orderId: string, parameters: LabResultParameter[], isSubmit = false) => {
    setLabOrders((prev) =>
      prev.map((ord) => {
        if (ord.orderId === orderId || ord.id === orderId) {
          const resStatus: ResultStatus = isSubmit ? 'Submitted' : 'Draft'
          return {
            ...ord,
            parameters,
            resultStatus: resStatus,
            technician: 'Lab Tech (Logged In)',
            submittedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
          }
        }
        return ord
      })
    )
    toast.success(isSubmit ? 'Lab result submitted for verification!' : 'Lab result saved as draft.')
  }

  const verifyLabResult = (orderId: string, verifiedBy: string, isReject = false, reason = '') => {
    setLabOrders((prev) =>
      prev.map((ord) => {
        if (ord.orderId === orderId || ord.id === orderId) {
          return {
            ...ord,
            resultStatus: isReject ? 'Rejected' : 'Verified',
            verifiedBy: isReject ? undefined : verifiedBy,
            verifiedDate: isReject ? undefined : new Date().toISOString().replace('T', ' ').slice(0, 16),
            rejectionReason: isReject ? reason : undefined,
          }
        }
        return ord
      })
    )
    toast.success(isReject ? 'Result rejected.' : 'Lab result verified successfully!')
  }

  const addTestMasterItem = (item: Omit<TestMasterItem, 'id'>) => {
    const newItem: TestMasterItem = {
      ...item,
      id: `test-${Date.now()}`,
    }
    setTestMaster((prev) => [newItem, ...prev])
    toast.success('New test added to Master catalogue.')
  }

  const updateTestMasterItem = (id: string, updates: Partial<TestMasterItem>) => {
    setTestMaster((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
    toast.success('Test Master item updated.')
  }

  // --- OP BILLING ACTIONS ---
  const createOPBill = (billData: Omit<OPBill, 'id' | 'billNo' | 'billDate'>): OPBill => {
    const count = opBills.length + 101
    const newBill: OPBill = {
      ...billData,
      id: `opb-${Date.now()}`,
      billNo: `OPB-2026-${String(count).padStart(4, '0')}`,
      billDate: new Date().toISOString().split('T')[0],
    }
    setOpBills((prev) => [newBill, ...prev])

    // Auto add Lab Order if lab test items present
    const labItems = newBill.items.filter((i) => i.category === 'Laboratory')
    if (labItems.length > 0) {
      const newLabOrder: LabOrder = {
        id: `ord-${Date.now()}`,
        orderId: `LOB-2026-${String(labOrders.length + 1).padStart(3, '0')}`,
        patientId: newBill.patientId,
        patientName: newBill.patientName,
        ageGender: 'Adult',
        visitType: 'OP',
        visitId: newBill.visitId,
        doctor: newBill.doctor,
        department: newBill.department,
        tests: labItems.map((l) => l.serviceName),
        priority: 'Routine',
        orderDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
        sampleStatus: 'Pending Collection',
        resultStatus: 'Pending Entry',
        billingStatus: newBill.paymentStatus === 'Paid' ? 'Paid' : 'Billed',
        mobile: newBill.mobile,
        opIpNumber: newBill.billNo,
      }
      setLabOrders((prev) => [newLabOrder, ...prev])
    }

    toast.success(`OP Bill ${newBill.billNo} created successfully!`)
    return newBill
  }

  const addOPPayment = (billNo: string, amount: number, mode: PaymentMode, ref: string, remarks?: string): boolean => {
    let success = false
    setOpBills((prev) =>
      prev.map((bill) => {
        if (bill.billNo === billNo) {
          if (amount > bill.balance) {
            toast.error(`Payment amount cannot exceed outstanding balance (₹${bill.balance}).`)
            return bill
          }
          const newPaid = bill.paidAmount + amount
          const newBalance = bill.billAmount - newPaid
          const pStatus = newBalance <= 0 ? 'Paid' : 'Partial'
          success = true

          const paymentRec: OPPayment = {
            id: `pay-${Date.now()}`,
            billNo,
            patientId: bill.patientId,
            patientName: bill.patientName,
            paymentDate: new Date().toISOString().split('T')[0],
            amount,
            paymentMode: mode,
            transactionRef: ref,
            remarks,
          }
          setOpPayments((p) => [paymentRec, ...p])

          return {
            ...bill,
            paidAmount: newPaid,
            balance: Math.max(0, newBalance),
            paymentStatus: pStatus,
            paymentMode: mode,
          }
        }
        return bill
      })
    )
    if (success) toast.success('OP Payment recorded successfully!')
    return success
  }

  const addOPRefund = (billNo: string, amount: number, mode: PaymentMode, reason: string, remarks?: string): boolean => {
    let success = false
    setOpBills((prev) =>
      prev.map((bill) => {
        if (bill.billNo === billNo) {
          if (amount > bill.paidAmount) {
            toast.error(`Refund amount cannot exceed total paid amount (₹${bill.paidAmount}).`)
            return bill
          }
          success = true
          const refundRec: OPRefund = {
            id: `ref-${Date.now()}`,
            billNo,
            patientId: bill.patientId,
            patientName: bill.patientName,
            refundDate: new Date().toISOString().split('T')[0],
            amount,
            refundMode: mode,
            reason,
            remarks,
          }
          setOpRefunds((r) => [refundRec, ...r])
          return {
            ...bill,
            billStatus: 'Refunded',
          }
        }
        return bill
      })
    )
    if (success) toast.success('OP Refund processed successfully!')
    return success
  }

  const cancelOPBill = (billNo: string, reason: string): boolean => {
    setOpBills((prev) =>
      prev.map((bill) => {
        if (bill.billNo === billNo) {
          return { ...bill, billStatus: 'Cancelled', remarks: `Cancelled: ${reason}` }
        }
        return bill
      })
    )
    toast.success(`Bill ${billNo} has been cancelled.`)
    return true
  }

  // --- IP BILLING ACTIONS ---
  const addIPCharge = (ipNo: string, charge: Omit<IPChargeItem, 'id' | 'date'>) => {
    setIpAccounts((prev) =>
      prev.map((acc) => {
        if (acc.ipNo === ipNo) {
          const newCharge: IPChargeItem = {
            ...charge,
            id: `ipc-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
          }
          const updatedCharges = [...acc.charges, newCharge]
          const total = updatedCharges.reduce((sum, c) => sum + c.amount, 0)
          const newOut = total - acc.discount - acc.insuranceAdjustment - acc.paidAmount
          return {
            ...acc,
            charges: updatedCharges,
            totalCharges: total,
            outstanding: Math.max(0, newOut),
          }
        }
        return acc
      })
    )
    toast.success('Charge item added to IP Account.')
  }

  const generateInterimBill = (ipNo: string): InterimBill | null => {
    const acc = ipAccounts.find((a) => a.ipNo === ipNo)
    if (!acc) return null

    const billNo = `INT-2026-${String(interimBills.length + 1).padStart(3, '0')}`
    const interim: InterimBill = {
      id: `int-${Date.now()}`,
      billNo,
      ipNo,
      patientId: acc.patientId,
      patientName: acc.patientName,
      billDate: new Date().toISOString().split('T')[0],
      previousBalance: 0,
      currentCharges: acc.totalCharges,
      discount: acc.discount,
      payments: acc.paidAmount,
      currentOutstanding: acc.outstanding,
      status: 'Generated',
    }

    setInterimBills((prev) => [interim, ...prev])
    setIpAccounts((prev) =>
      prev.map((a) => (a.ipNo === ipNo ? { ...a, accountStatus: 'Interim Billed' } : a))
    )
    toast.success(`Interim Bill ${billNo} generated. IP Account remains Active.`)
    return interim
  }

  const generateFinalIPBill = (ipNo: string): FinalIPBill | null => {
    const acc = ipAccounts.find((a) => a.ipNo === ipNo)
    if (!acc) return null

    const billNo = `FIN-2026-${String(finalIpBills.length + 1).padStart(3, '0')}`
    const grandTotal = acc.totalCharges - acc.discount - acc.insuranceAdjustment + acc.tax
    const finalBill: FinalIPBill = {
      id: `fin-${Date.now()}`,
      billNo,
      ipNo,
      patientId: acc.patientId,
      patientName: acc.patientName,
      admissionDate: acc.admissionDate,
      dischargeDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      wardRoomBed: `${acc.ward} / ${acc.room} / ${acc.bed}`,
      doctor: acc.doctor,
      totalCharges: acc.totalCharges,
      discount: acc.discount,
      insuranceAdjustment: acc.insuranceAdjustment,
      tax: acc.tax,
      grandTotal,
      paidAmount: acc.paidAmount,
      outstanding: Math.max(0, grandTotal - acc.paidAmount),
      billDate: new Date().toISOString().split('T')[0],
      status: 'Finalized',
    }

    setFinalIpBills((prev) => [finalBill, ...prev])
    setIpAccounts((prev) =>
      prev.map((a) => (a.ipNo === ipNo ? { ...a, accountStatus: 'Ready for Discharge' } : a))
    )
    toast.success(`Final IP Bill ${billNo} generated successfully!`)
    return finalBill
  }

  const addIPPayment = (ipNo: string, amount: number, _mode: PaymentMode, _ref: string, _remarks?: string): boolean => {
    let success = false
    setIpAccounts((prev) =>
      prev.map((acc) => {
        if (acc.ipNo === ipNo) {
          if (amount > acc.outstanding) {
            toast.error(`Payment amount cannot exceed outstanding balance (₹${acc.outstanding}).`)
            return acc
          }
          const newPaid = acc.paidAmount + amount
          const netTotal = acc.totalCharges - acc.discount - acc.insuranceAdjustment
          const newOut = Math.max(0, netTotal - newPaid)
          success = true
          return {
            ...acc,
            paidAmount: newPaid,
            outstanding: newOut,
          }
        }
        return acc
      })
    )
    if (success) toast.success('IP Payment recorded successfully!')
    return success
  }

  const addIPRefund = (ipNo: string, amount: number, _mode: PaymentMode, _reason: string): boolean => {
    let success = false
    setIpAccounts((prev) =>
      prev.map((acc) => {
        if (acc.ipNo === ipNo) {
          if (amount > acc.paidAmount) {
            toast.error(`Refund amount cannot exceed total paid amount (₹${acc.paidAmount}).`)
            return acc
          }
          success = true
          return {
            ...acc,
            accountStatus: 'Cancelled',
          }
        }
        return acc
      })
    )
    if (success) toast.success('IP Refund / Cancellation completed.')
    return success
  }

  return (
    <LabBillingContext.Provider
      value={{
        labOrders,
        testMaster,
        updateSampleStatus,
        saveLabResult,
        verifyLabResult,
        addTestMasterItem,
        updateTestMasterItem,
        serviceMaster,
        opBills,
        opPayments,
        opRefunds,
        createOPBill,
        addOPPayment,
        addOPRefund,
        cancelOPBill,
        ipAccounts,
        interimBills,
        finalIpBills,
        addIPCharge,
        generateInterimBill,
        generateFinalIPBill,
        addIPPayment,
        addIPRefund,
      }}
    >
      {children}
    </LabBillingContext.Provider>
  )
}

export const useLabBilling = () => {
  const context = useContext(LabBillingContext)
  if (!context) {
    throw new Error('useLabBilling must be used within a LabBillingProvider')
  }
  return context
}

