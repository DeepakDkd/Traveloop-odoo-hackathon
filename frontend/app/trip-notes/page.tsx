'use client'

import { FormEvent, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppContext } from '@/lib/context'
import { screenVariants, containerVariants, itemVariants, cardVariants } from '@/lib/motion-config'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

type Note = {
    id: string
    title: string
    content: string
    createdAt: string
}

type NoteForm = {
    title: string
    content: string
}

const initialForm: NoteForm = {
    title: '',
    content: ''
}

const NotesScreen = () => {
    const { setCurrentScreen } = useAppContext()
    const [notes, setNotes] = useState<Note[]>([
        {
            id: '1',
            title: 'Must-See Attractions in Paris',
            content: 'Eiffel Tower, Louvre, Notre Dame, Arc de Triomphe, Sacre-Coeur...',
            createdAt: '2024-01-15'
        },
        {
            id: '2',
            title: 'Restaurant Recommendations',
            content: "Le Cafe de Flore - Traditional French bistro\nL'Astrance - Michelin starred...",
            createdAt: '2024-01-16'
        },
        {
            id: '3',
            title: 'Budget Reminders',
            content: 'Total spent so far: $4200. Remaining: $800. Be careful with shopping!',
            createdAt: '2024-01-17'
        }
    ])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [form, setForm] = useState<NoteForm>(initialForm)

    const openModal = () => {
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setForm(initialForm)
    }

    const handleDeleteNote = (id: string) => {
        setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id))
        toast.success('Note deleted')
    }

    const handleCreateNote = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const title = form.title.trim()
        const content = form.content.trim()

        if (!title || !content) {
            toast.error('Please add both a title and note details')
            return
        }

        const createdAt = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date())

        setNotes((currentNotes) => [
            {
                id: crypto.randomUUID(),
                title,
                content,
                createdAt
            },
            ...currentNotes
        ])

        closeModal()
        toast.success('Note added')
    }

    return (
        <>
            <motion.div
                variants={screenVariants}
                initial="initial"
                animate="animate"
                className="min-h-screen bg-white"
            >
                <motion.div
                    variants={itemVariants}
                    className="sticky top-0 z-40 border-b-2 border-gray-200 bg-white"
                >
                    <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                        <Button
                            onClick={() => setCurrentScreen('dashboard')}
                            variant="ghost"
                            className="mb-4 flex items-center gap-2 text-gray-700"
                        >
                            <ArrowLeft size={20} /> Back
                        </Button>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Trip Notes</h1>
                                <p className="mt-1 text-gray-600">Keep track of important information</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                                    {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                                </div>
                                <Button
                                    onClick={openModal}
                                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    <Plus size={20} /> New Note
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
                >
                    {notes.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {notes.map((note) => (
                                <motion.div
                                    key={note.id}
                                    variants={cardVariants}
                                    whileHover="hover"
                                    className="cursor-pointer"
                                >
                                    <Card className="flex h-full flex-col border-2 border-gray-200 p-6 transition-colors hover:border-blue-300">
                                        <div className="flex-1">
                                            <h3 className="mb-3 line-clamp-2 text-lg font-bold text-gray-900">
                                                {note.title}
                                            </h3>
                                            <p className="line-clamp-5 whitespace-pre-wrap text-sm text-gray-600">
                                                {note.content}
                                            </p>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                                            <span className="text-xs text-gray-500">{note.createdAt}</span>
                                            <Button
                                                onClick={() => handleDeleteNote(note.id)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div variants={itemVariants} className="py-16 text-center">
                            <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-blue-200 bg-blue-50/60 px-6 py-12">
                                <h2 className="text-2xl font-bold text-gray-900">Start your travel note board</h2>
                                <p className="mt-3 text-lg text-gray-600">
                                    Capture reminders, itineraries, restaurant picks, and budget ideas in one place.
                                </p>
                                <Button
                                    onClick={openModal}
                                    className="mx-auto mt-6 flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    <Plus size={20} /> Add Your First Note
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {isModalOpen ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-2xl"
                        >
                            <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white py-0 shadow-2xl">
                                <div className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-cyan-50 px-6 py-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
                                                Note Composer
                                            </p>
                                            <h2 className="mt-2 text-2xl font-bold text-slate-900">Add a new trip note</h2>
                                            <p className="mt-2 text-sm text-slate-600">
                                                Save the little details now so they are easy to find on the road.
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={closeModal}
                                            className="text-slate-500 hover:bg-white hover:text-slate-900"
                                        >
                                            <X size={18} />
                                        </Button>
                                    </div>
                                </div>

                                <form onSubmit={handleCreateNote} className="space-y-5 px-6 py-6">
                                    <div className="space-y-2">
                                        <label htmlFor="note-title" className="text-sm font-semibold text-slate-800">
                                            Title
                                        </label>
                                        <input
                                            id="note-title"
                                            type="text"
                                            value={form.title}
                                            onChange={(event) =>
                                                setForm((currentForm) => ({
                                                    ...currentForm,
                                                    title: event.target.value
                                                }))
                                            }
                                            placeholder="Ex: Cafes to try in Kyoto"
                                            className="register-input h-12 w-full rounded-2xl px-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                            maxLength={80}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <label htmlFor="note-content" className="text-sm font-semibold text-slate-800">
                                                Note details
                                            </label>
                                            <span className="text-xs text-slate-400">{form.content.length}/500</span>
                                        </div>
                                        <textarea
                                            id="note-content"
                                            value={form.content}
                                            onChange={(event) =>
                                                setForm((currentForm) => ({
                                                    ...currentForm,
                                                    content: event.target.value
                                                }))
                                            }
                                            placeholder="Add bookings, addresses, reminders, or any travel tips you want to keep handy."
                                            className="register-input min-h-40 w-full rounded-2xl px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                            maxLength={500}
                                        />
                                    </div>

                                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={closeModal}
                                            className="h-11 rounded-xl border-slate-300 px-5 text-slate-700"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="h-11 rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700"
                                        >
                                            Save Note
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </>
    )
}

export default NotesScreen
