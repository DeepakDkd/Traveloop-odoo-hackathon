'use client'

import { motion } from 'framer-motion'
import { useAppContext } from '@/lib/context'
import { screenVariants, containerVariants, itemVariants, cardVariants } from '@/lib/motion-config'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Heart, MessageCircle } from 'lucide-react'

const CommunityScreen = () => {
    const { setCurrentScreen } = useAppContext()

    const posts = [
        {
            id: '1',
            author: 'Sarah',
            avatar: '👩‍🦰',
            title: 'Best Street Food in Bangkok',
            excerpt: 'Just finished exploring the night markets. Here are my top 5 must-try dishes...',
            likes: 245,
            comments: 32,
            image: '🍜'
        },
        {
            id: '2',
            author: 'Mike',
            avatar: '👨',
            title: 'Budget Hiking in Peru',
            excerpt: 'Completed the Inca Trail last week! Here\'s how I did it for under $500...',
            likes: 189,
            comments: 28,
            image: '⛰️'
        },
        {
            id: '3',
            author: 'Emma',
            avatar: '👩‍🦱',
            title: 'Hidden Gems in Portugal',
            excerpt: 'Skip Lisbon and Sintra - here are the places the locals love...',
            likes: 312,
            comments: 45,
            image: '🏖️'
        },
        {
            id: '4',
            author: 'James',
            avatar: '👨‍💼',
            title: 'Digital Nomad Life in Bali',
            excerpt: '6 months working remotely from Bali - Here\'s what I learned...',
            likes: 428,
            comments: 67,
            image: '💻'
        }
    ]

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
                className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
            >
                {/* Feed */}
                <div className="space-y-6">
                    {posts.map((post) => (
                        <motion.div
                            key={post.id}
                            variants={cardVariants}
                            whileHover="hover"
                            className="cursor-pointer"
                        >
                            <Card className="border-2 border-gray-200 overflow-hidden hover:border-blue-300 transition-colors">
                                <div className="p-6">
                                    {/* Author */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="text-2xl">{post.avatar}</div>
                                        <div>
                                            <p className="font-bold text-gray-900">{post.author}</p>
                                            <p className="text-xs text-gray-500">2 days ago</p>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                                    <div className="flex gap-4 mb-4">
                                        <div className="flex-1">
                                            <p className="text-gray-700">{post.excerpt}</p>
                                        </div>
                                        <div className="text-4xl">{post.image}</div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-6 pt-4 border-t border-gray-200 text-gray-600">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Heart size={18} />
                                            <span className="text-sm">{post.likes}</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                        >
                                            <MessageCircle size={18} />
                                            <span className="text-sm">{post.comments}</span>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Load More */}
                <motion.div variants={itemVariants} className="mt-8 text-center">
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Load More Posts
                    </Button>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}
export default CommunityScreen
