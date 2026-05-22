import { useState, useEffect } from 'react'
import KHRAForm from './KHRAForm'
import AdminPanel from './src/AdminPanel'

const ADMIN_SESSION_KEY = 'khra_admin_session'
const PAGE_SESSION_KEY = 'khra_page'

export default function App() {
  const [page, setPage] = useState(() =>
    sessionStorage.getItem(PAGE_SESSION_KEY) === 'admin' ? 'admin' : 'form'
  )
  const [adminLoggedIn, setAdminLoggedInState] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === '1'
  )
  const [editData, setEditData] = useState(null)

  useEffect(() => {
    sessionStorage.setItem(PAGE_SESSION_KEY, page)
  }, [page])

  const setAdminLoggedIn = (value) => {
    if (value) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, '1')
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY)
    }
    setAdminLoggedInState(value)
  }

  const goToEdit = (member) => {
    setEditData(member)
    setPage('form')
  }

  const goToForm = () => {
    setEditData(null)
    setPage('form')
  }

  const goToAdmin = () => {
    setEditData(null)
    setPage('admin')
  }

  const handleLogout = () => {
    setAdminLoggedIn(false)
    setEditData(null)
    setPage('form')
  }

  return page === 'admin'
    ? (
      <AdminPanel
        onBack={goToForm}
        onEdit={goToEdit}
        loggedIn={adminLoggedIn}
        onLogin={() => setAdminLoggedIn(true)}
        onLogout={handleLogout}
      />
    )
    : (
      <KHRAForm
        key={editData ? `edit-${editData.id}` : 'new'}
        onAdminClick={() => setPage('admin')}
        editData={editData}
        onEditDone={goToAdmin}
      />
    )
}
