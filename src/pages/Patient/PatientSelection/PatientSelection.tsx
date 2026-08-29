import React, { useState } from 'react'
import { Plus, CheckCircle2, Users, ArrowRight, User, Calendar, Shield, Edit3, Trash2, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PatientHeader } from '@/common/PatientHeader'
import { DeleteConfirmationDialog } from '@/common/DeleteConfirmationDialog'
import { EditPatientModal } from '../Profile/EditPatientModal'
import { type Patient } from '@/types/patient.types'
import { initials, capitalizeName, calcAge } from '@/utils/patient.utils'

interface PatientSelectionProps {
  patients: Patient[]
  spSelectedId: string | null
  setSpSelectedId: (id: string) => void
  onAddPatient: () => void
  onContinue: () => void
  onEditSuccess?: (updatedPatient: Patient) => void
  onDeletePatient?: (patientId: string | number) => Promise<boolean | void>
  currentUserId?: number | null
}

export const PatientSelection: React.FC<PatientSelectionProps> = ({
  patients,
  spSelectedId,
  setSpSelectedId,
  onAddPatient,
  onContinue,
  onEditSuccess,
  onDeletePatient,
  currentUserId,
}) => {
  // State for Edit Patient Modal
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // State for Delete Confirmation Dialog
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleOpenEdit = (p: Patient, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingPatient(p)
    setIsEditModalOpen(true)
  }

  const handleOpenDelete = (p: Patient, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingPatient(p)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingPatient || !onDeletePatient) return
    const pid = deletingPatient.PatientID || deletingPatient.id
    if (!pid) return

    setIsDeleting(true)
    try {
      await onDeletePatient(pid)
      setIsDeleteDialogOpen(false)
      setDeletingPatient(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#e2e8f0] dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-slate-100 font-sans">
      <PatientHeader />

      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
          {/* Header Section */}
          <div className="relative overflow-hidden px-8 py-7" style={{ background: "var(--blue-text-color)" }}>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-7 h-7 text-white/90" />
                <div className="font-bold text-xl text-white tracking-tight">Select Patient</div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-white/70" />
                <p className="text-sm text-white/90 font-medium">Choose a profile to continue</p>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full"></div>
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-white/5 rounded-full"></div>
          </div>

          {/* Patient List */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {patients.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No patient profiles found. Please register a new patient.
              </div>
            ) : (
              patients.map((p, idx) => {
                const pId = String(p.PatientID || p.id || idx)
                const pRawName = p.PatientName || p.name || `Patient #${pId}`
                const pDob = p.DOB || p.dob || ''
                const pGender = p.Gender || p.gender || '—'
                const pMobile = p.PhoneNo || p.phoneNo || p.mobile || ''
                const age = p.Age !== undefined ? p.Age : (pDob ? calcAge(pDob) : '')
                const isActive = pId === spSelectedId
                return (
                  <div
                    key={pId}
                    onClick={() => setSpSelectedId(pId)}
                    className={`flex items-center gap-3 px-6 py-4 cursor-pointer transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {initials(pRawName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-sm truncate ${
                            isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {capitalizeName(pRawName)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {pMobile && (
                          <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            {pMobile}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          {age !== '' ? `${age} Years` : '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          {pGender}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons: Edit, Delete, Selected Checkmark */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(p, e)}
                        title="Edit Patient"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      {onDeletePatient && (
                        <button
                          type="button"
                          onClick={(e) => handleOpenDelete(p, e)}
                          title="Delete Patient"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {isActive && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 animate-in fade-in zoom-in duration-200 ml-1" />
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Register New Patient Button */}
          <button
            onClick={onAddPatient}
            className="w-full text-left px-6 py-4 border-t border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all duration-200 flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-all">
              <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Register New Patient
                <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">New</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Register another patient profile</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
          </button>

          {/* Continue Button */}
          <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
            <Button
              disabled={!spSelectedId || patients.length === 0}
              onClick={onContinue}
              className="w-full text-white font-semibold cursor-pointer py-5 text-base transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'var(--blue-btn)', borderRadius: "12px" }}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            {!spSelectedId && patients.length > 0 && (
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
                Please select a patient to continue
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Patient Modal */}
      <EditPatientModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingPatient(null)
        }}
        patient={editingPatient}
        currentUserId={currentUserId}
        onSuccess={(updated) => {
          onEditSuccess?.(updated)
        }}
      />

      {/* Delete Patient Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Patient Profile"
        description="Are you sure you want to delete this patient profile? This action cannot be undone."
        itemName={deletingPatient?.PatientName || deletingPatient?.name}
        confirmLabel="Delete Patient"
        isDeleting={isDeleting}
      />
    </div>
  )
}