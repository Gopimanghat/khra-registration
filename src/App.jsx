import { useState } from 'react'
import KHRAForm from './KHRAForm'
import AdminPanel from './src/AdminPanel'

export default function App() {
  const [page, setPage] = useState('form')
  const [editData, setEditData] = useState(null)

  const goToEdit = (member) => {
    setEditData(member)
    setPage('form')
  }

  const goToForm = () => {
    setEditData(null)
    setPage('form')
  }

  return page === 'admin'
    ? <AdminPanel onBack={goToForm} onEdit={goToEdit} />
    : <KHRAForm onAdminClick={() => setPage('admin')} editData={editData} onEditDone={goToForm} />
}