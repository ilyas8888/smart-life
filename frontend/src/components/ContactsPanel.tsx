import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Trash2, Phone, Mail, MapPin, Search, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

interface Contact {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
}

export default function ContactsPanel() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ['contacts', search],
    queryFn: () => api.get('/contacts', { params: search ? { search } : {} }).then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/contacts/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); toast.success('Contact supprimé') },
  })

  const resetForm = () => {
    setName('')
    setPhone('')
    setEmail('')
    setAddress('')
    setNotes('')
  }

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/contacts', {
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        notes: notes || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] })
      resetForm()
      setShowForm(false)
      toast.success('Contact ajouté')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })

  if (isLoading) return <div className="text-center py-12 text-gray-400 dark:text-gray-500">Chargement...</div>

  const handleCancel = () => {
    resetForm()
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Users className="text-primary-600" />
          Contacts ({contacts.length})
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              className="input pl-9 w-full sm:w-56"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Ajouter un contact
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            createMutation.mutate()
          }}
          className="card mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom complet"
              required
            />
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Téléphone"
            />
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              className="input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Adresse"
            />
            <textarea
              className="input md:col-span-2 resize-none"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <X size={16} />
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!name.trim() || createMutation.isPending}
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {contacts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucun contact.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((c) => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-700 dark:text-primary-50 flex items-center justify-center font-bold text-lg mr-3">
                  {c.name[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{c.name}</p>
                  {c.phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <Phone size={12} /> {c.phone}
                    </p>
                  )}
                  {c.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Mail size={12} /> {c.email}
                    </p>
                  )}
                  {c.address && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPin size={12} /> {c.address}
                    </p>
                  )}
                  {c.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">{c.notes}</p>}
                </div>
                <button
                  onClick={() => deleteMutation.mutate(c.id)}
                  className="p-1 text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors ml-2"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
