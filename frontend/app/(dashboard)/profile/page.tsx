'use client'

import { motion } from 'framer-motion'
import { useAppContext } from '@/lib/context'
import { screenVariants, containerVariants, itemVariants, cardVariants } from '@/lib/motion-config'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Edit2 } from 'lucide-react'

const ProfileScreen = () => {
    const { setCurrentScreen, currentUser } = useAppContext()

    const preplannedTrips = [
        { id: 1, title: 'Trip 1', destination: 'Paris' },
        { id: 2, title: 'Trip 2', destination: 'Tokyo' },
        { id: 3, title: 'Trip 3', destination: 'Barcelona' },
    ]

    const previousTrips = [
        { id: 4, title: 'Previous 1', destination: 'New York' },
        { id: 5, title: 'Previous 2', destination: 'London' },
        { id: 6, title: 'Previous 3', destination: 'Dubai' },
    ]

    return (
        <motion.div
            variants={screenVariants}
            initial="initial"
            animate="animate"
            className="min-h-screen bg-white"
        >
            {/* Header */}
            <motion.div
                variants={itemVariants}
                className="bg-white border-b border-gray-200 sticky top-0 z-50"
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Button
                        onClick={() => setCurrentScreen('dashboard')}
                        variant="ghost"
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-2"
                    >
                        <ArrowLeft size={20} /> Back
                    </Button>
                </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
                {/* Title and Badge */}
                <motion.div variants={itemVariants} className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        User Profile Pages <span className="text-sm text-blue-600">(Screen 7)</span>
                    </h1>
                    <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">
                        SIH FINALIST 2025
                    </div>
                </motion.div>

                {/* Username Row */}
                <motion.div variants={itemVariants} className="flex justify-between items-center mb-8 border-b border-gray-300 pb-4">
                    <span className="text-2xl font-semibold text-gray-900">Traveloop</span>
                    <span className="text-2xl font-semibold text-blue-600">AshaArepalli</span>
                </motion.div>

                {/* Profile Section */}
                <motion.div variants={itemVariants} className="flex gap-8 mb-12 p-6 border border-gray-300 rounded-lg bg-gray-50">
                    {/* Profile Image */}
                    <div className="shrink-0">
                        <div className="w-40 h-40 rounded-full border-2 border-gray-400 flex items-center justify-center bg-white">
                            <span className="text-gray-500 text-center text-sm">Image of the User</span>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="flex-1">
                        <div className="border border-gray-300 rounded-lg p-6 h-full bg-white">
                            <p className="text-gray-700 text-lg leading-relaxed">
                                User Details with appropriate option to edit those information.....
                            </p>
                            <Button
                                variant="outline"
                                className="mt-6 border border-gray-400 text-gray-700 hover:bg-gray-100"
                            >
                                <Edit2 size={18} className="mr-2" />
                                Edit Profile
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Preplanned Trips */}
                <motion.div variants={itemVariants} className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Preplanned Trips</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {preplannedTrips.map((trip) => (
                            <motion.div key={trip.id} variants={cardVariants}>
                                <Card className="bg-white border border-gray-300 h-48 flex flex-col items-center justify-center gap-4 hover:border-gray-400 transition-colors">
                                    <div className="text-gray-600 text-center">
                                        <p className="font-semibold">{trip.title}</p>
                                        <p className="text-sm">{trip.destination}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="border border-gray-400 text-gray-700 hover:bg-gray-100"
                                    >
                                        View
                                    </Button>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Previous Trips */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Previous Trips</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {previousTrips.map((trip) => (
                            <motion.div key={trip.id} variants={cardVariants}>
                                <Card className="bg-white border border-gray-300 h-48 flex flex-col items-center justify-center gap-4 hover:border-gray-400 transition-colors">
                                    <div className="text-gray-600 text-center">
                                        <p className="font-semibold">{trip.title}</p>
                                        <p className="text-sm">{trip.destination}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="border border-gray-400 text-gray-700 hover:bg-gray-100"
                                    >
                                        View
                                    </Button>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}
export default ProfileScreen
