import React, { useMemo, Suspense, lazy } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePatientAuth } from '@/hooks/usePatientAuth'
import { usePatientRegistration } from '@/hooks/usePatientRegistration'
import { useAppointmentBooking } from '@/hooks/useAppointmentBooking'
import { PageLoader } from '@/components/PageLoader'

import PatientLogin from './Login/PatientLogin'

// Lazy-loaded post-login components
const PatientRegistration = lazy(() => import('./Registration/PatientRegistration'))
const PatientSelection = lazy(() => import('./PatientSelection/PatientSelection').then(m => ({ default: m.PatientSelection })))
const PatientDashboard = lazy(() => import('./Dashboard/PatientDashboard').then(m => ({ default: m.PatientDashboard })))
const MobileProfilePage = lazy(() => import('./Profile/MobileProfilePage').then(m => ({ default: m.MobileProfilePage })))
const BookingOtpModal = lazy(() => import('./Appointment/BookingOtpModal').then(m => ({ default: m.BookingOtpModal })))
const CancelOtpModal = lazy(() => import('./Appointment/CancelOtpModal').then(m => ({ default: m.CancelOtpModal })))
const BookingSuccessModal = lazy(() => import('./Appointment/BookingSuccessModal').then(m => ({ default: m.BookingSuccessModal })))
const ReceiptModal = lazy(() => import('@/common/ReceiptModal').then(m => ({ default: m.ReceiptModal })))
const MaleConfirmModal = lazy(() => import('./Appointment/MaleConfirmModal').then(m => ({ default: m.MaleConfirmModal })))

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
                <Suspense fallback={<PageLoader message="Loading Registration..." subMessage="Setting up your patient registration form" />}>
                    <PatientRegistration
                        pendingMobile={auth.pendingMobile}
                        regName={reg.regName}
                        setRegName={reg.setRegName}
                        regGender={reg.regGender}
                        setRegGender={reg.setRegGender}
                        regDob={reg.regDob}
                        setRegDob={reg.setRegDob}
                        regAge={reg.regAge}
                        setRegAge={reg.setRegAge}
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
                </Suspense>
            )}

            {/* SCREEN 3: SELECT PATIENT */}
            {auth.screen === 'select' && (
                <Suspense fallback={<PageLoader message="Loading Patient Profiles..." subMessage="Fetching your registered patient records" />}>
                    <PatientSelection
                        patients={auth.patientsList}
                        spSelectedId={auth.spSelectedId}
                        setSpSelectedId={auth.setSpSelectedId}
                        onAddPatient={() => auth.openRegisterForm(auth.currentMobile, 'addPatient')}
                        onContinue={auth.handleSelectPatientContinue}
                        onEditSuccess={auth.handleUpdatePatientSuccess}
                        onDeletePatient={auth.handleDeletePatient}
                        currentUserId={auth.currentUserId}
                        isLoading={auth.isLoadingPatient}
                        isContinuing={auth.isContinuing}
                    />
                </Suspense>
            )}

            {/* SCREEN 4: APP DASHBOARD / PROFILE */}
            {auth.screen === 'app' && isProfileRoute && (
                <Suspense fallback={<PageLoader message="Loading Profile..." subMessage="Retrieving your patient medical profile" />}>
                    <MobileProfilePage
                        currentPatient={auth.currentPatient}
                        isLoadingPatient={auth.isLoadingPatient}
                        patientError={auth.patientError}
                        patients={auth.patientsList}
                        onSelectPatient={auth.selectPatientProfile}
                        onSelectPatientClick={() => auth.setScreen('select')}
                        onAddPatient={() => auth.openRegisterForm(auth.currentMobile, 'addPatient')}
                        onLogout={auth.handleLogout}
                        currentUserId={auth.currentUserId}
                        onEditSuccess={auth.handleUpdatePatientSuccess}
                    />
                </Suspense>
            )}

            {auth.screen === 'app' && !isProfileRoute && (
                <Suspense fallback={<PageLoader message="Preparing Dashboard..." subMessage="Loading appointments and health records" />}>
                    <PatientDashboard
                        currentPatient={auth.currentPatient}
                        isLoadingPatient={auth.isLoadingPatient}
                        patientError={auth.patientError}
                        patients={auth.patientsList}
                        onSelectPatient={auth.selectPatientProfile}
                        onSelectPatientClick={() => auth.setScreen('select')}
                        onAddPatient={() => auth.openRegisterForm(auth.currentMobile, 'addPatient')}
                        onLogout={auth.handleLogout}
                        currentUserId={auth.currentUserId}
                        onEditSuccess={auth.handleUpdatePatientSuccess}
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
                </Suspense>
            )}

            {/* GLOBAL MODALS */}
            <Suspense fallback={null}>
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
                    step={booking.cancelStep}
                    reason={booking.cancelReason}
                    setReason={booking.setCancelReason}
                    reasonErr={booking.cancelReasonErr}
                    isGeneratingOtp={booking.isGeneratingCancelOtp}
                    onContinueToOtp={booking.handleContinueToCancelOtp}
                    otpInput={booking.cancelOtpInput}
                    setOtpInput={booking.setCancelOtpInput}
                    otpErr={booking.cancelOtpErr}
                    isVerifying={booking.isVerifyingCancelOtp}
                    isResending={booking.isResendingCancelOtp}
                    onVerify={booking.handleVerifyCancelOtp}
                    onResend={booking.handleResendCancelOtp}
                    onBackToReason={booking.handleBackToCancelReason}
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

                {/* Male Patient Appointment Warning Confirmation Modal */}
                <MaleConfirmModal
                    isOpen={booking.showMaleConfirmModal}
                    onClose={booking.handleCancelMaleBooking}
                    onConfirm={booking.handleConfirmMaleBooking}
                />
            </Suspense>
        </>
    )
}

export default PatientModule
