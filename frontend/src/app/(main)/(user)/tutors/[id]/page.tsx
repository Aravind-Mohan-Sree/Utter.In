'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getTutorDetails, getTutorSessions, createBookingOrder, verifyBookingPayment } from '~services/user/tutorService';
import { utterAlert } from '~utils/utterAlert';
import Loader from '~components/shared/Loader';
import { utterToast } from '~utils/utterToast';
import { errorHandler } from '~utils/errorHandler';
import ProfileDetail from '~components/profile/ProfileDetail';
import SessionList, { Session } from '~components/shared/SessionList';
import Avatar from '~components/shared/Avatar';
import AbstractShapesBackground from '~components/shared/AbstractShapesBackground';
import { API_ROUTES } from '~constants/routes';

declare global {
    interface Window {
        Razorpay: any;
    }
}

import { Tutor, Session as ApiSession } from '~types/tutor';
import { Session as FrontendSession } from '~components/shared/SessionList';

export default function TutorDetailsPage() {
    const params = useParams();
    const id = params?.id as string;
    const [tutor, setTutor] = useState<Tutor | null>(null);
    const [sessions, setSessions] = useState<FrontendSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchDetails = async () => {
        try {
            const res = await getTutorDetails(id);
            setTutor(res.tutor);
        } catch (error) {
            utterToast.error(errorHandler(error));
        } finally {
            setLoading(false);
        }
    };

    const fetchSessions = async () => {
        setSessionsLoading(true);
        try {
            const res = await getTutorSessions(id, selectedDate);

            const mappedSessions = res.sessions.map((s: ApiSession) => ({
                id: s.id,
                time: new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                language: s.language,
                topic: s.topic,
                booked: s.status === 'Booked',
                date: new Date(s.scheduledAt).toISOString().split('T')[0],
                status: s.status,
                scheduledAt: s.scheduledAt,
                price: s.price
            }));
            setSessions(mappedSessions);
        } catch (error) {
            utterToast.error(errorHandler(error));
        } finally {
            setSessionsLoading(false);
        }
    };

    const handleBook = async (sessionId: string, price: number) => {
        utterAlert({
            title: 'Confirm Booking',
            text: `Are you sure you want to book this session for ₹${price}?`,
            confirmText: 'Pay Now',
            showCancel: true,
            icon: 'question',
            onConfirm: async () => {
                try {
                    setSessionsLoading(true);
                    const orderData = await createBookingOrder(price, 'INR', sessionId);

                    const options = {
                        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                        amount: orderData.order.amount,
                        currency: orderData.order.currency,
                        name: 'Utter.In',
                        description: 'Tutor Session Booking',
                        order_id: orderData.order.id,
                        handler: async function (response: any) {
                            try {
                                await verifyBookingPayment({
                                    ...response,
                                    sessionId,
                                    tutorId: tutor?.id,
                                    amount: orderData.order.amount / 100,
                                    currency: orderData.order.currency
                                });
                                utterToast.success('Session booked successfully!');
                                fetchSessions();
                            } catch (error) {
                                utterToast.error('Payment verification failed');
                            }
                        },
                        prefill: {
                            name: 'User',
                            email: 'user@example.com',
                            contact: '9999999999'
                        },
                        theme: {
                            color: '#F43F5E'
                        }
                    };

                    const rzp1 = new window.Razorpay(options);
                    rzp1.on('payment.failed', function (response: any) {
                        utterToast.error(response.error.description);
                    });
                    rzp1.open();
                } catch (error) {
                    utterToast.error(errorHandler(error));
                } finally {
                    setSessionsLoading(false);
                }
            }
        });
    };

    useEffect(() => {
        if (id) {
            fetchDetails();
        } else {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchSessions();
        }
    }, [id, selectedDate]);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
    if (!tutor) return <div className="min-h-screen flex items-center justify-center">Tutor not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-rose-50">
            <AbstractShapesBackground />
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                {/* Left Column: Tutor Profile */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4">
                                <Avatar
                                    user={{
                                        name: tutor.name,
                                        avatarUrl: `${API_ROUTES.TUTOR.FETCH_AVATAR}/${tutor.id}.jpeg?v=${Date.now()}`,
                                        role: 'tutor'
                                    }}
                                    size="lg"
                                    editable={false}
                                />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">{tutor.name}</h1>
                            {/* Email removed as per request */}

                            <div className="w-full border-t border-gray-100 pt-6 text-left">
                                <ProfileDetail
                                    bio={tutor.bio}
                                    languages={tutor.knownLanguages}
                                    experience={tutor.yearsOfExperience}
                                    certificationType={tutor.certificationType}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sessions */}
                <div className="lg:col-span-8">
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[600px]">
                        <SessionList
                            sessions={sessions}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            userType="user"
                            loading={sessionsLoading}
                            minDate={new Date().toISOString().split('T')[0]}
                            onBook={(sessionId) => {
                                const session = sessions.find(s => s.id === sessionId);
                                if (session) handleBook(sessionId, session.price);
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
