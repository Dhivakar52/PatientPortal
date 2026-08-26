import React, { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePatientAuth } from '@/hooks/usePatientAuth'
import { usePatientRegistration } from '@/hooks/usePatientRegistration'
import { useAppointmentBooking } from '@/hooks/useAppointmentBooking'

import PatientLogin from './Login/PatientLogin'
import PatientRegistration from './Registration/PatientRegistration'
import { PatientSelection } from './PatientSelection/PatientSelection'
import { PatientDashboard } from './Dashboard/PatientDashboard'
import { MobileProfilePage } from './Profile/MobileProfilePage'
import { BookingOtpModal } from './Appointment/BookingOtpModal'
import { CancelOtpModal } from './Appointment/CancelOtpModal'
import { BookingSuccessModal } from './Appointment/BookingSuccessModal'
import { ReceiptModal } from '@/common/ReceiptModal'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from '@/components/ui/alert-dialog'

const PatientModule: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const isProfileRoute = location.pathname === '/profile' || location.pathname === '/patient/profile'
    // 1. Auth & Patient Flow Hook
    const auth = usePatientAuth()

    // 2. Patient Registration Form Hook
    const reg = usePatientRegistration({
        pendingMobile: auth.pendingMobile,
        registerContext: auth.registerContext,
        authUserId: auth.currentUserId,
        setUsersDB: auth.setUsersDB,
        setCurrentMobile: auth.setCurrentMobile,
        setActivePatientId: auth.setActivePatientId,
        setScreen: auth.setScreen,
        fetchCurrentPatient: auth.fetchCurrentPatient,
        setApiPatient: auth.setApiPatient,
        setApiPatientsList: auth.setApiPatientsList,
    })

    // 3. Appointment Booking Hook
    const booking = useAppointmentBooking(auth.currentPatient)

    // Derive appointments for active patient
    const patientKey = auth.currentPatient ? String(auth.currentPatient.PatientID || auth.currentPatient.id || '') : ''
    const patientAppointments = patientKey ? booking.appointmentsDB[patientKey] || [] : []

    const receiptPatient = useMemo(() => {
        if (!booking.selectedReceiptAppt) return auth.currentPatient
        const apptPid = booking.selectedReceiptAppt.PatientID
        if (apptPid && auth.apiPatientsList && auth.apiPatientsList.length > 0) {
            const found = auth.apiPatientsList.find(p => Number(p.PatientID) === Number(apptPid))
            if (found) return found
        }
        if (apptPid && auth.currentUserRecord?.patients) {
            const found = auth.currentUserRecord.patients.find(p => Number(p.PatientID || p.id) === Number(apptPid))
            if (found) return found
        }
        return auth.currentPatient
    }, [booking.selectedReceiptAppt, auth.currentPatient, auth.apiPatientsList, auth.currentUserRecord])

    return (
        <>
            {/* SCREEN 1: LOGIN */}
            {auth.screen === 'login' && (
                <PatientLogin
                    loginMobileInput={auth.loginMobileInput}
                    setLoginMobileInput={auth.setLoginMobileInput}
                    loginMobileErr={auth.loginMobileErr}
                    showLoginOtpBlock={auth.showLoginOtpBlock}
                    loginOtpInput={auth.loginOtpInput}
                    setLoginOtpInput={auth.setLoginOtpInput}
                    loginOtpErr={auth.loginOtpErr}
                    isGeneratingOtp={auth.isGeneratingOtp}
                    isVerifyingOtp={auth.isVerifyingOtp}
                    onGenerateOtp={auth.handleGenerateLoginOtp}
                    onVerifyOtp={auth.handleVerifyLoginOtp}
                    onResendOtp={auth.handleResendLoginOtp}
                />
            )}

            {/* SCREEN 2: REGISTRATION */}
            {auth.screen === 'register' && (
                <PatientRegistration
                    pendingMobile={auth.pendingMobile}
                    regName={reg.regName}
                    setRegName={reg.setRegName}
                    regGender={reg.regGender}
                    setRegGender={reg.setRegGender}
                    regDob={reg.regDob}
                    setRegDob={reg.setRegDob}
                    regAddress={reg.regAddress}
                    setRegAddress={reg.setRegAddress}
                    regCity={reg.regCity}
                    setRegCity={reg.setRegCity}
                    regState={reg.regState}
                    setRegState={reg.setRegState}
                    regPincode={reg.regPincode}
                    setRegPincode={reg.setRegPincode}
                    regEmail={reg.regEmail}
                    setRegEmail={reg.setRegEmail}
                    regErrors={reg.regErrors}
                    isSubmitting={reg.isSubmitting}
                    onSubmit={reg.handleRegisterSubmit}
                    onBack={reg.handleBack}
                />
            )}

            {/* SCREEN 3: SELECT PATIENT */}
            {auth.screen === 'select' && (
                <PatientSelection
                    patients={auth.patientsList}
                    spSelectedId={auth.spSelectedId}
                    setSpSelectedId={auth.setSpSelectedId}
                    onAddPatient={() => auth.openRegisterForm(auth.currentMobile, 'addPatient')}
                    onContinue={auth.handleSelectPatientContinue}
                />
            )}

            {/* SCREEN 4: APP DASHBOARD / PROFILE */}
            {auth.screen === 'app' && isProfileRoute && (
                <MobileProfilePage
                    currentPatient={auth.currentPatient}
                    isLoadingPatient={auth.isLoadingPatient}
                    patientError={auth.patientError}
                    patients={auth.patientsList}
                    onSelectPatient={async (id) => {
                        auth.setActivePatientId(id)
                        auth.setSpSelectedId(id)
                        await auth.fetchCurrentPatient(id)
                        auth.setUsersDB((prev) => ({
                            ...prev,
                            [auth.currentMobile]: {
                                ...prev[auth.currentMobile],
                                activePatientId: id,
                            },
                        }))
                    }}
                    onSelectPatientClick={() => auth.setScreen('select')}
                    onAddPatient={() => auth.openRegisterForm(auth.currentMobile, 'addPatient')}
                    onLogout={auth.handleLogout}
                />
            )}

            {auth.screen === 'app' && !isProfileRoute && (
                <PatientDashboard
                    currentPatient={auth.currentPatient}
                    isLoadingPatient={auth.isLoadingPatient}
                    patientError={auth.patientError}
                    patients={auth.patientsList}
                    onSelectPatient={async (id) => {
                        auth.setActivePatientId(id)
                        auth.setSpSelectedId(id)
                        await auth.fetchCurrentPatient(id)
                        auth.setUsersDB((prev) => ({
                            ...prev,
                            [auth.currentMobile]: {
                                ...prev[auth.currentMobile],
                                activePatientId: id,
                            },
                        }))
                    }}
                    patientAppointments={patientAppointments}
                    onSelectPatientClick={() => auth.setScreen('select')}
                    onAddPatient={() => auth.openRegisterForm(auth.currentMobile, 'addPatient')}
                    onLogout={auth.handleLogout}
                    bookDate={booking.bookDate}
                    setBookDate={booking.setBookDate}
                    bookDoctor={booking.bookDoctor}
                    setBookDoctor={booking.setBookDoctor}
                    bookUnit={booking.bookUnit}
                    setBookUnit={booking.setBookUnit}
                    selectedSlot={booking.selectedSlot}
                    setSelectedSlot={booking.setSelectedSlot}
                    selectedDepartmentId={booking.selectedDepartmentId}
                    setSelectedDepartmentId={booking.setSelectedDepartmentId}
                    selectedDoctorId={booking.selectedDoctorId}
                    setSelectedDoctorId={booking.setSelectedDoctorId}
                    selectedTimeSlotId={booking.selectedTimeSlotId}
                    setSelectedTimeSlotId={booking.setSelectedTimeSlotId}
                    isConfirming={booking.isConfirming}
                    bookErrors={booking.bookErrors}
                    onConfirmBooking={booking.handleConfirmBookingClick}
                    onViewReceipt={booking.handleViewReceipt}
                    onCancelAppointment={booking.handleCancelAppointment}
                />
            )}

            {/* GLOBAL MODALS */}
            <BookingOtpModal
                isOpen={booking.showBookOtpModal}
                onClose={() => booking.setShowBookOtpModal(false)}
                patientMobile={auth.currentPatient?.mobile}
                bookOtpInput={booking.bookOtpInput}
                setBookOtpInput={booking.setBookOtpInput}
                bookOtpErr={booking.bookOtpErr}
                onVerify={() => booking.handleVerifyBookOtp(() => { })}
                onResend={booking.handleResendBookOtp}
            />

            <CancelOtpModal
                isOpen={booking.showCancelOtpModal}
                onClose={() => booking.setShowCancelOtpModal(false)}
                appointment={booking.selectedCancelAppt}
                patientMobile={auth.currentPatient?.PhoneNo || auth.currentPatient?.mobile}
                otpInput={booking.cancelOtpInput}
                setOtpInput={booking.setCancelOtpInput}
                otpErr={booking.cancelOtpErr}
                isVerifying={booking.isVerifyingCancelOtp}
                isResending={booking.isResendingCancelOtp}
                onVerify={booking.handleVerifyCancelOtp}
                onResend={booking.handleResendCancelOtp}
            />

            <BookingSuccessModal
                isOpen={booking.showSuccessModal}
                lastBookedAppt={booking.lastBookedAppt}
                onClose={() => booking.handleSuccessClose(() => {
                    auth.setScreen('app')
                    navigate('/patient/home')
                })}
            />

            <ReceiptModal
                isOpen={booking.showReceiptModal}
                onClose={() => booking.setShowReceiptModal(false)}
                appt={booking.selectedReceiptAppt}
                patient={receiptPatient}
            />

            {/* Male Patient Appointment Confirmation Alert */}
            <AlertDialog open={booking.showMaleConfirmModal} onOpenChange={booking.setShowMaleConfirmModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Appointment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please confirm that you want to book this appointment for the selected male patient.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={booking.handleCancelMaleBooking}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={booking.handleConfirmMaleBooking}>
                            Confirm & Proceed
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default PatientModule
