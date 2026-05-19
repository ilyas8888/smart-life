import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Trash2, Phone, Mail, MapPin, Search, Plus, X, Edit2, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

interface Contact {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  createdAt: string
}

type ContactForm = {
  name: string
  phone: string
  email: string
  address: string
  notes: string
}

const AVATAR_COLORS = [
  'bg-blue-500 text-white',
  'bg-violet-500 text-white',
  'bg-rose-500 text-white',
  'bg-amber-500 text-white',
  'bg-green-500 text-white',
  'bg-cyan-500 text-white',
  'bg-pink-500 text-white',
  'bg-indigo-500 text-white',
  'bg-teal-500 text-white',
  'bg-orange-500 text-white',
  'bg-sky-500 text-white',
  'bg-emerald-500 text-white',
  'bg-fuchsia-500 text-white',
  'bg-lime-500 text-white',
  'bg-red-500 text-white',
  'bg-purple-500 text-white',
]

function avatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function emptyForm(): ContactForm {
  return { name: '', phone: '', email: '', address: '', notes: '' }
}

function formFromContact(contact: Contact): ContactForm {
  return {
    name: contact.name,
    phone: contact.phone ?? '',
    email: contact.email ?? '',
    address: contact.address ?? '',
    notes: contact.notes ?? '',
  }
}

function contactPayload(form: ContactForm) {
  return {
    name: form.name.trim(),
    phone: form.phone.trim() || null,
    email: form.email.trim() || null,
    address: form.address.trim() || null,
    notes: form.notes.trim() || null,
  }
}

function StatTile({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{value}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 flex items-center justify-center">
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

function ContactFormFields({
  form,
  onChange,
}: {
  form: ContactForm
  onChange: (form: ContactForm) => void
}) {
  return (
    <div className="space-y-3">
      <input
        className="input"
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
        placeholder="Nom complet"
        required
      />
      <input
        className="input"
        value={form.phone}
        onChange={(e) => onChange({ ...form, phone: e.target.value })}
        placeholder="Téléphone"
      />
      <input
        className="input"
        type="email"
        value={form.email}
        onChange={(e) => onChange({ ...form, email: e.target.value })}
        placeholder="Email"
      />
      <input
        className="input"
        value={form.address}
        onChange={(e) => onChange({ ...form, address: e.target.value })}
        placeholder="Adresse"
      />
      <textarea
        className="input resize-none min-h-[110px]"
        value={form.notes}
        onChange={(e) => onChange({ ...form, notes: e.target.value })}
        placeholder="Notes"
      />
    </div>
  )
}

function ContactCard({
  contact,
  onOpen,
  onEdit,
  onDelete,
}: {
  contact: Contact
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <button type="button" onClick={onOpen} className="card text-left hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 ${avatarColor(contact.name)}`}>
          {initials(contact.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{contact.name}</p>
          {contact.phone && (
            <a href={`tel:${contact.phone}`} onClick={(e) => e.stopPropagation()}
              className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 hover:text-primary-600 dark:hover:text-primary-300">
              <Phone size={13} /> <span className="truncate">{contact.phone}</span>
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} onClick={(e) => e.stopPropagation()}
              className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 hover:text-primary-600 dark:hover:text-primary-300">
              <Mail size={13} /> <span className="truncate">{contact.email}</span>
            </a>
          )}
          {contact.address && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <MapPin size={13} className="shrink-0" /> <span className="truncate">{contact.address}</span>
            </p>
          )}
          {contact.notes && (
            <p className="mt-2 text-xs italic text-gray-400 dark:text-gray-500 line-clamp-1">{contact.notes}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button type="button" onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
          <Edit2 size={15} />
        </button>
        {contact.phone && (
          <button type="button" onClick={(e) => { e.stopPropagation(); window.open(`tel:${contact.phone}`) }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
            <Phone size={15} />
          </button>
        )}
        {contact.email && (
          <button type="button" onClick={(e) => { e.stopPropagation(); window.open(`mailto:${contact.email}`) }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
            <Mail size={15} />
          </button>
        )}
        <button type="button" onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto">
          <Trash2 size={15} />
        </button>
      </div>
    </button>
  )
}

function ContactModal({
  contact,
  initialMode = 'view',
  onClose,
  onUpdate,
  onDelete,
}: {
  contact: Contact
  initialMode?: 'view' | 'edit'
  onClose: () => void
  onUpdate: (id: number, form: ContactForm) => void
  onDelete: (id: number) => void
}) {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode)
  const [form, setForm] = useState<ContactForm>(() => formFromContact(contact))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {mode === 'view' ? (
          <>
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 ${avatarColor(contact.name)}`}>
                {initials(contact.name)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{contact.name}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Fiche contact</p>
              </div>
              <button type="button" onClick={() => setMode('edit')}
                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <Edit2 size={16} />
              </button>
              <button type="button" onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20">
                  <Phone size={17} className="text-green-500" /> {contact.phone}
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                  <Mail size={17} className="text-primary-500" /> {contact.email}
                </a>
              )}
              {contact.address && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <MapPin size={17} className="text-rose-500 mt-0.5 shrink-0" /> <span>{contact.address}</span>
                </div>
              )}
              {contact.notes && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <FileText size={17} className="text-amber-500 mt-0.5 shrink-0" /> <p className="whitespace-pre-wrap text-sm">{contact.notes}</p>
                </div>
              )}
              {!contact.phone && !contact.email && !contact.address && !contact.notes && (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Aucune information supplémentaire.</p>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 dark:border-gray-700">
              <button type="button" onClick={() => { onDelete(contact.id); onClose() }}
                className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300 font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                Supprimer
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (form.name.trim()) onUpdate(contact.id, form) }}>
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Modifier le contact</h3>
              <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <ContactFormFields form={form} onChange={setForm} />
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={() => { setForm(formFromContact(contact)); setMode('view') }} className="btn-secondary">Annuler</button>
                <button type="submit" className="btn-primary" disabled={!form.name.trim()}>Sauvegarder</button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function AddContactModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (form: ContactForm) => void
}) {
  const [form, setForm] = useState<ContactForm>(() => emptyForm())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={(e) => { e.preventDefault(); if (form.name.trim()) onCreate(form) }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg"
      >
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users size={19} className="text-primary-600" /> Nouveau contact
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <ContactFormFields form={form} onChange={setForm} />
          <div className="flex justify-end gap-2 mt-5">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={!form.name.trim()}>Ajouter</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default function ContactsPanel() {
  const qc = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [initialModalMode, setInitialModalMode] = useState<'view' | 'edit'>('view')

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ['contacts'],
    queryFn: () => api.get('/contacts').then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/contacts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contact supprimé')
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  const createMutation = useMutation({
    mutationFn: (form: ContactForm) => api.post('/contacts', contactPayload(form)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] })
      setShowAddModal(false)
      toast.success('Contact ajouté')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: number; form: ContactForm }) => api.put(`/contacts/${id}`, contactPayload(form)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] })
      setSelectedContact(null)
      toast.success('Contact mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })

  const filteredContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return contacts
    return contacts.filter((contact) =>
      [contact.name, contact.phone, contact.email].some((value) => value?.toLowerCase().includes(query))
    )
  }, [contacts, searchQuery])

  const groupedContacts = useMemo(() => {
    const groups = filteredContacts.reduce<Record<string, Contact[]>>((acc, contact) => {
      const letter = contact.name.trim()[0]?.toUpperCase() || '#'
      if (!acc[letter]) acc[letter] = []
      acc[letter].push(contact)
      return acc
    }, {})
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([letter, items]) => ({
        letter,
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
      }))
  }, [filteredContacts])

  const stats = {
    total: contacts.length,
    phone: contacts.filter((contact) => contact.phone).length,
    email: contacts.filter((contact) => contact.email).length,
    notes: contacts.filter((contact) => contact.notes).length,
  }

  const openContact = (contact: Contact, mode: 'view' | 'edit' = 'view') => {
    setSelectedContact(contact)
    setInitialModalMode(mode)
  }

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400 dark:text-gray-500">Chargement...</div>
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Users className="text-primary-600" />
              Contacts
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Carnet d'adresses personnel</p>
          </div>
          <button type="button" onClick={() => setShowAddModal(true)} className="btn-primary flex items-center justify-center gap-2">
            <Plus size={16} /> Ajouter un contact
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTile label="Total contacts" value={stats.total} icon={Users} />
          <StatTile label="Avec téléphone" value={stats.phone} icon={Phone} />
          <StatTile label="Avec email" value={stats.email} icon={Mail} />
          <StatTile label="Avec notes" value={stats.notes} icon={FileText} />
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            className="input pl-9 pr-9 w-full"
            placeholder="Rechercher par nom, téléphone ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 mx-auto mb-4 flex items-center justify-center">
            <Users size={30} />
          </div>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Aucun contact</h3>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Ajoutez vos contacts pour les retrouver facilement.</p>
          <button type="button" onClick={() => setShowAddModal(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Ajouter votre premier contact
          </button>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-16">
          <Search size={34} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="font-semibold text-gray-700 dark:text-gray-300">Aucun contact trouvé</p>
        </div>
      ) : (
        <div>
          {groupedContacts.map((group) => (
            <section key={group.letter} className="mt-4 first:mt-0">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{group.letter}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onOpen={() => openContact(contact)}
                    onEdit={() => openContact(contact, 'edit')}
                    onDelete={() => deleteMutation.mutate(contact.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onCreate={(form) => createMutation.mutate(form)}
        />
      )}

      {selectedContact && (
        <ContactModal
          key={`${selectedContact.id}-${initialModalMode}`}
          contact={selectedContact}
          initialMode={initialModalMode}
          onClose={() => setSelectedContact(null)}
          onUpdate={(id, form) => updateMutation.mutate({ id, form })}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      )}
    </div>
  )
}
