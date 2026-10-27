import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = '/api/memberships'
const EMPTY_FORM = {
  memberName: '',
  membershipType: 'Individual',
  startDate: new Date().toISOString().slice(0, 10),
  annualFee: '',
}
const MEMBERSHIP_TYPES = ['Individual', 'Family', 'Student', 'Patron']

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Request failed (${response.status})`)
  }

  return response.status === 204 ? null : response.json()
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function App() {
  const [memberships, setMemberships] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All memberships')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadMemberships = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setMemberships(await request(API_URL))
    } catch (loadError) {
      setError(`Could not load memberships. ${loadError.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMemberships()
  }, [loadMemberships])

  const filteredMemberships = useMemo(() => {
    const query = search.trim().toLowerCase()
    return memberships.filter((membership) => {
      const matchesSearch = !query
        || membership.memberName.toLowerCase().includes(query)
        || membership.membershipType.toLowerCase().includes(query)
        || String(membership.id).includes(query)
      const matchesType = typeFilter === 'All memberships' || membership.membershipType === typeFilter
      return matchesSearch && matchesType
    })
  }, [memberships, search, typeFilter])

  const annualRevenue = memberships.reduce((sum, member) => sum + (Number(member.annualFee) || 0), 0)
  const membershipCounts = MEMBERSHIP_TYPES.map((type) => ({
    type,
    count: memberships.filter((membership) => membership.membershipType === type).length,
  }))

  function openCreateForm() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, startDate: new Date().toISOString().slice(0, 10) })
    setError('')
    setModalOpen(true)
  }

  function openEditForm(membership) {
    setEditingId(membership.id)
    setForm({
      memberName: membership.memberName,
      membershipType: membership.membershipType,
      startDate: membership.startDate,
      annualFee: String(membership.annualFee),
    })
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    const payload = { ...form, annualFee: Number(form.annualFee) }

    try {
      if (editingId === null) {
        await request(API_URL, { method: 'POST', body: JSON.stringify(payload) })
        setNotice('Membership added to the register.')
      } else {
        await request(`${API_URL}/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
        setNotice('Membership details have been updated.')
      }
      setModalOpen(false)
      await loadMemberships()
    } catch (saveError) {
      setError(`Could not save this membership. ${saveError.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(membership) {
    if (!window.confirm(`Remove ${membership.memberName} from the membership register?`)) return

    setError('')
    setNotice('')
    try {
      await request(`${API_URL}/${membership.id}`, { method: 'DELETE' })
      setNotice(`${membership.memberName} has been removed.`)
      await loadMemberships()
    } catch (deleteError) {
      setError(`Could not remove this membership. ${deleteError.message}`)
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="The Gallery home">
          <span className="brand-mark" aria-hidden="true">G</span>
          <span className="brand-copy"><strong>THE GALLERY</strong><small>MUSEUM OF ART & CULTURE</small></span>
        </a>
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item" href="#overview"><span className="nav-icon">⌂</span>Overview</a>
          <a className="nav-item active" href="#members"><span className="nav-icon">▤</span>Memberships<span className="nav-count">{memberships.length}</span></a>
          <a className="nav-item" href="#insights"><span className="nav-icon">▥</span>Insights</a>
        </nav>
        <div className="sidebar-note">
          <span className="note-icon">✳</span>
          <p>Every visit is a new way to see.</p>
          <span>THANK YOU FOR SUPPORTING THE ARTS</span>
        </div>
        <div className="sidebar-footer"><span className="status-dot" />Membership desk <span className="online-label">ONLINE</span></div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Memberships</strong></div>
          <div className="topbar-right"><span className="today-label">{new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</span><span className="avatar">G</span></div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow"><span /> THE GALLERY · MEMBER SERVICES</div>
              <h1>Memberships<span>.</span></h1>
              <p className="page-subtitle">A little closer to the art. Manage your community of museum members.</p>
            </div>
            <button className="button button-primary" type="button" onClick={openCreateForm}><span className="plus-icon">＋</span> Add member</button>
          </section>

          <section className="stats-grid" aria-label="Membership overview">
            <article className="stat-card stat-members">
              <div className="stat-top"><span className="stat-label">TOTAL MEMBERS</span><span className="stat-symbol">◉</span></div>
              <div className="stat-value">{memberships.length.toString().padStart(2, '0')}</div>
              <div className="stat-caption">In your museum community</div>
              <div className="stat-line"><span style={{ width: `${Math.min(memberships.length * 5, 100)}%` }} /></div>
            </article>
            <article className="stat-card stat-revenue">
              <div className="stat-top"><span className="stat-label">ANNUAL MEMBERSHIP VALUE</span><span className="stat-symbol">↗</span></div>
              <div className="stat-value">{formatCurrency(annualRevenue)}</div>
              <div className="stat-caption">Combined annual member fees</div>
              <div className="stat-accent">A YEAR OF ART, MADE POSSIBLE BY YOU</div>
            </article>
            <article className="stat-card stat-mix" id="insights">
              <div className="stat-top"><span className="stat-label">MEMBERSHIP MIX</span><span className="stat-symbol">✳</span></div>
              <div className="mix-list">
                {membershipCounts.map(({ type, count }) => (
                  <div className="mix-row" key={type}><span>{type}</span><span className="mix-track"><i style={{ width: `${memberships.length ? (count / memberships.length) * 100 : 0}%` }} /></span><strong>{count}</strong></div>
                ))}
              </div>
            </article>
          </section>

          <section className="members-panel" id="members">
            <div className="panel-heading">
              <div><span className="section-kicker">THE PEOPLE BEHIND THE ART</span><h2>Member directory <span>{memberships.length}</span></h2></div>
              <div className="panel-tools">
                <label className="search-box"><span aria-hidden="true">⌕</span><input aria-label="Search members" placeholder="Search members..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></label>
                <select className="filter-select" aria-label="Filter by membership type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                  <option>All memberships</option>
                  {MEMBERSHIP_TYPES.map((type) => <option key={type}>{type}</option>)}
                </select>
              </div>
            </div>

            {error && !modalOpen && <div className="feedback feedback-error" role="alert">{error}<button type="button" onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}
            {notice && <div className="feedback feedback-success" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}

            <div className="table-scroll">
              <table>
                <thead><tr><th>MEMBER</th><th>MEMBERSHIP</th><th>MEMBER SINCE</th><th>ANNUAL FEE</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td className="table-message" colSpan="5">Opening the membership register…</td></tr>
                  ) : filteredMemberships.length ? filteredMemberships.map((membership, index) => (
                    <tr key={membership.id}>
                      <td><div className="member-cell"><span className={`member-avatar avatar-${index % 5}`}>{membership.memberName.trim().charAt(0).toUpperCase()}</span><span><strong>{membership.memberName}</strong><small>Member #{String(membership.id).padStart(4, '0')}</small></span></div></td>
                      <td><span className={`type-badge type-${membership.membershipType.toLowerCase()}`}>{membership.membershipType}</span></td>
                      <td className="date-cell">{formatDate(membership.startDate)}</td>
                      <td className="fee-cell">{formatCurrency(membership.annualFee)}<small> / year</small></td>
                      <td><div className="row-actions"><button type="button" onClick={() => openEditForm(membership)} aria-label={`Edit ${membership.memberName}`}>Edit</button><button type="button" className="delete-action" onClick={() => handleDelete(membership)} aria-label={`Remove ${membership.memberName}`}>Remove</button></div></td>
                    </tr>
                  )) : (
                    <tr><td className="table-message" colSpan="5"><span className="empty-icon">✳</span><strong>{memberships.length ? 'No members match your search.' : 'Your member register is ready.'}</strong><span>{memberships.length ? 'Try another name or membership type.' : 'Add your first member to get started.'}</span>{!memberships.length && <button className="button button-outline" type="button" onClick={openCreateForm}>Add your first member</button>}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-footer"><span>Showing <strong>{filteredMemberships.length}</strong> of <strong>{memberships.length}</strong> members</span><span className="footer-decoration">ART IS FOR EVERYONE <i>✳</i></span></div>
          </section>

          <footer className="page-footer"><span>THE GALLERY <i>·</i> MUSEUM OF ART & CULTURE</span><span>Made for those who believe in art.</span></footer>
        </div>
      </main>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false) }}>
          <section className="membership-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-header"><div><span className="section-kicker">{editingId === null ? 'WELCOME TO THE GALLERY' : 'MEMBER DETAILS'}</span><h2 id="modal-title">{editingId === null ? 'Add a member' : 'Edit membership'}<span>.</span></h2></div><button className="modal-close" type="button" onClick={() => setModalOpen(false)} aria-label="Close dialog">×</button></div>
            <form onSubmit={handleSubmit}>
              <label className="form-field">Full name<input autoFocus required maxLength="120" value={form.memberName} onChange={(event) => setForm({ ...form, memberName: event.target.value })} placeholder="e.g. Ananya Rao" /></label>
              <div className="form-row">
                <label className="form-field">Membership type<select value={form.membershipType} onChange={(event) => setForm({ ...form, membershipType: event.target.value })}>{MEMBERSHIP_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
                <label className="form-field">Member since<input required type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></label>
              </div>
              <label className="form-field">Annual fee <span className="input-prefix"><i>₹</i><input required type="number" min="0" step="0.01" value={form.annualFee} onChange={(event) => setForm({ ...form, annualFee: event.target.value })} placeholder="0.00" /></span></label>
              {error && <div className="feedback feedback-error modal-error" role="alert">{error}</div>}
              <div className="modal-actions"><button className="button button-outline" type="button" onClick={() => setModalOpen(false)}>Cancel</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editingId === null ? 'Add member' : 'Save changes'}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
