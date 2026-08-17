import React from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatientAuth } from '@/hooks/usePatientAuth'
import { usePatientRegistration } from '@/hooks/usePatientRegistration'
import { useAppointmentBooking } from '@/hooks/useAppointmentBooking'

import PatientLogin from './Login/PatientLogin'
import PatientRegistration from './Registration/PatientRegistration'
import { PatientSelection } from './PatientSelection/PatientSelection'
import { PatientDashboard } from './Dashboard/PatientDashboard'
import { BookingOtpModal } from './Appointment/BookingOtpModal'
import { BookingSuccessModal } from './Appointment/BookingSuccessModal'
import { ReceiptModal } from '@/common/ReceiptModal'

const PatientModule: React.FC = () => {
    const navigate = useNavigate()
    // 1. Auth & Patient Flow Hook
    const auth = usePatientAuth()

    // 2. Patient Registration Form Hook
    const reg = usePatientRegistration({
        pendingMobile: auth.pendingMobile,
        registerContext: auth.registerContext,
        setUsersDB: auth.setUsersDB,
        setCurrentMobile: auth.setCurrentMobile,
        setActivePatientId: auth.setActivePatientId,
        setScreen: auth.setScreen,
    })

    // 3. Appointment Booking Hook
    const booking = useAppointmentBooking(auth.currentPatient)

    // Derive appointments for active patient
    const patientAppointments = auth.currentPatient
        ? booking.appointmentsDB[auth.currentPatient.id] || []
        : []

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
                    regErrors={reg.regErrors}
                    onSubmit={reg.handleRegisterSubmit}
                    onBack={reg.handleBack}
                />
            )}

            {/* SCREEN 3: SELECT PATIENT */}
            {auth.screen === 'select' && (
                <PatientSelection
                    patients={auth.currentUserRecord?.patients || []}
                    spSelectedId={auth.spSelectedId}
                    setSpSelectedId={auth.setSpSelectedId}
                    onAddPatient={() => auth.openRegisterForm(auth.currentMobile, 'addPatient')}
                    onContinue={auth.handleSelectPatientContinue}
                />
            )}

            {/* SCREEN 4: APP DASHBOARD */}
            {auth.screen === 'app' && (
                <PatientDashboard
                    currentPatient={auth.currentPatient}
                    patients={auth.currentUserRecord?.patients || []}
                    onSelectPatient={(id) => {
                      auth.setActivePatientId(id)
                      auth.setSpSelectedId(id)
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
                    bookErrors={booking.bookErrors}
                    onConfirmBooking={booking.handleConfirmBookingClick}
                    onViewReceipt={booking.handleViewReceipt}
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
                patient={auth.currentPatient}
            />
        </>
    )
}

export default PatientModule
