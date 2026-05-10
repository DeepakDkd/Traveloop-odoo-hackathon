'use client'

import { motion } from 'framer-motion'
import { useAppContext } from '@/lib/context'
import { screenVariants, containerVariants, itemVariants, cardVariants } from '@/lib/motion-config'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { mockBudgetEntries } from '@/lib/mock-data'

const BudgetScreen = () => {
    const { setCurrentScreen } = useAppContext()

    const totalBudget = mockBudgetEntries.reduce((sum, entry) => sum + entry.amount, 0)
    const totalSpent = mockBudgetEntries.reduce((sum, entry) => sum + entry.spent, 0)
    const remaining = totalBudget - totalSpent
    const categoryColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']

    return (
        <motion.div
            variants={screenVariants}
            initial="initial"
            animate="animate"
            className="min-h-screen bg-white"
        >
        

            {/* Main Content */}
            <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
            >
                {/* Summary Cards */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12"
                >
                    <Card className="p-4 sm:p-6 border-2 border-gray-200">
                        <div className="text-gray-600 text-sm font-medium">Total Budget</div>
                        <div className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
                            ${totalBudget}
                        </div>
                    </Card>
                    <Card className="p-4 sm:p-6 border-2 border-gray-200">
                        <div className="text-gray-600 text-sm font-medium">Total Spent</div>
                        <div className="text-3xl sm:text-4xl font-bold text-red-600 mt-2">
                            ${totalSpent}
                        </div>
                    </Card>
                    <Card className="p-4 sm:p-6 border-2 border-gray-200">
                        <div className="text-gray-600 text-sm font-medium">Remaining</div>
                        <div className="text-3xl sm:text-4xl font-bold text-green-600 mt-2">
                            ${remaining}
                        </div>
                    </Card>
                    <Card className="p-4 sm:p-6 border-2 border-gray-200">
                        <div className="text-gray-600 text-sm font-medium">Spent %</div>
                        <div className="text-3xl sm:text-4xl font-bold text-blue-600 mt-2">
                            {Math.round((totalSpent / totalBudget) * 100)}%
                        </div>
                    </Card>
                </motion.div>

                {/* Charts Section */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <Card className="p-6 border-2 border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Budget vs Spent by Category</h3>
                        <div className="space-y-5">
                            {mockBudgetEntries.map((entry, index) => {
                                const spentPercent = Math.min((entry.spent / entry.amount) * 100, 100)

                                return (
                                    <div key={entry.id} className="space-y-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-sm font-medium text-gray-900">{entry.category}</span>
                                            <span className="text-sm text-gray-600">
                                                ${entry.spent} / ${entry.amount}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-3 w-full rounded-full bg-blue-100 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-blue-500"
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                            <div className="h-3 w-full rounded-full bg-red-100 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-red-500"
                                                    style={{ width: `${spentPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>

                    <Card className="p-6 border-2 border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Spending Distribution</h3>
                        <div className="space-y-4">
                            {mockBudgetEntries.map((entry, index) => {
                                const percent = totalSpent === 0 ? 0 : (entry.spent / totalSpent) * 100

                                return (
                                    <div key={entry.id} className="space-y-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                                                />
                                                <span className="text-sm font-medium text-gray-900">{entry.category}</span>
                                            </div>
                                            <span className="text-sm text-gray-600">{percent.toFixed(0)}%</span>
                                        </div>
                                        <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${percent}%`,
                                                    backgroundColor: categoryColors[index % categoryColors.length],
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                </motion.div>

                {/* Category Details */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Budget by Category</h2>
                    <div className="space-y-4">
                        {mockBudgetEntries.map((entry) => (
                            <motion.div key={entry.id} variants={cardVariants} whileHover="hover">
                                <Card className="p-4 sm:p-6 border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">{entry.category}</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                ${entry.spent} of ${entry.amount} spent
                                            </p>
                                        </div>
                                        <div className="flex-1 sm:max-w-xs">
                                            <div className="w-full bg-gray-300 rounded-full h-3">
                                                <div
                                                    className="bg-blue-600 h-3 rounded-full"
                                                    style={{ width: `${(entry.spent / entry.amount) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-right mt-2 text-sm text-gray-600">
                                                {Math.round((entry.spent / entry.amount) * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Back Button */}
                <motion.div variants={itemVariants} className="mt-8">
                    <Button
                        onClick={() => setCurrentScreen('dashboard')}
                        variant="ghost"
                        className="w-full border-2 border-gray-300 text-gray-700 h-12"
                    >
                        Back to Dashboard
                    </Button>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}
export default BudgetScreen
