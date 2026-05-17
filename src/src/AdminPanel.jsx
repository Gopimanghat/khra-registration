import { useState, useEffect } from "react";

const API_URL = "https://khra-registration.onrender.com"
const SUPABASE_URL = "https://vjcavgqmphoremcwybmk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqY2F2Z3FtcGhvcmVtY3d5Ym1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NjQyMDEsImV4cCI6MjA5NDU0MDIwMX0.78WLXqWDpaBYrWzRpyeYDoV2C-ixRRaWs2kAioqlO6g";
const ADMIN_EMAIL = "admin@khra.com";
const ADMIN_PASSWORD = "khra@2024";

const DISTRICTS = ["Thiruvananthapuram","Kollam","Pathanamthitta","Alappuzha","Kottayam","Idukki","Ernakulam","Thrissur","Palakkad","Malappuram","Kozhikode","Wayanad","Kannur","Kasaragod"];

async function fetchMembers() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/members?select=*&order=created_at.desc`, {
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}



async function deleteMember(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/members?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(await res.text());
}

export default function AdminPanel({ onBack, onEdit }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleLogin = () => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid email or password.");
    }
  };

  useEffect(() => {
    if (loggedIn) {
      setLoading(true);
      fetchMembers()
        .then(setMembers)
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [loggedIn]);

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.owner_name?.toLowerCase().includes(q) ||
      m.establishment_name?.toLowerCase().includes(q) ||
      m.mobile?.includes(q) ||
      m.phone?.includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.fssai_licence?.toLowerCase().includes(q) ||
      m.licence_receipt_number?.toLowerCase().includes(q);
    const matchDistrict = !filterDistrict || m.district === filterDistrict;
    return matchSearch && matchDistrict;
  });

  const districts = [...new Set(members.map(m => m.district).filter(Boolean))].sort();



  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMember(deleteTarget.id);
      setMembers(prev => prev.filter(m => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      alert("Delete failed: " + e.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── Login Screen ──────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 shadow-lg shadow-orange-200">K</div>
            <h2 className="text-xl font-bold text-gray-800">Admin Login</h2>
            <p className="text-xs text-gray-400 mt-1">KHRA Registration Portal</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="admin@khra.com"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition-all" />
            </div>
            {loginError && (
              <div className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl border border-red-100">⚠️ {loginError}</div>
            )}
            <button onClick={handleLogin}
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-all shadow-md shadow-orange-100">
              Login →
            </button>
            <button onClick={onBack}
              className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-all">
              ← Back to Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ───────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-gray-50">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-lg shadow shadow-orange-200">K</div>
              <div>
                <div className="font-bold text-gray-800 text-sm leading-tight">KHRA Admin Panel</div>
                <div className="text-xs text-gray-400">Primary Membership Registry</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 hidden sm:block">{members.length} members total</span>
              <button onClick={onBack}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-all">
                ← Form
              </button>
              <button onClick={() => setLoggedIn(false)} title="Logout"
                className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-xs text-red-500 hover:bg-red-100 transition-all font-medium">
                ⏻ Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Members", value: members.length, color: "text-orange-500" },
              { label: "This Month", value: members.filter(m => new Date(m.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length, color: "text-blue-500" },
              { label: "Districts", value: districts.length, color: "text-purple-500" },
              { label: "Showing", value: filtered.length, color: "text-green-500" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍  Search by name, hotel, mobile, email, licence..."
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition-all" />
            <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
              <option value="">All Districts</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {(search || filterDistrict) && (
              <button onClick={() => { setSearch(""); setFilterDistrict(""); }}
                className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-all whitespace-nowrap">
                ✕ Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-gray-400 text-sm">Loading members...</div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-gray-400 text-sm">No members found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1000px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["#","Owner Name","Establishment","District","Mobile","Email","Type","AC","Photo","Licence","Registered","Actions"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m, i) => (
                      <tr key={m.id} className="border-b border-gray-50 hover:bg-orange-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{m.owner_name || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{m.establishment_name || "—"}</td>
                        <td className="px-4 py-3">
                          {m.district ? <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium whitespace-nowrap">{m.district}</span> : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{m.mobile || m.phone || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{m.email || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(m.establishment_type || []).map(t => (
                              <span key={t} className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-xs font-medium whitespace-nowrap">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {m.ac_status ? <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium whitespace-nowrap">{m.ac_status}</span> : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {m.photo_url
                            ? <a href={m.photo_url} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 transition-all whitespace-nowrap">📷 View</a>
                            : <span className="text-gray-300 text-xs">None</span>}
                        </td>
                        <td className="px-4 py-3">
                          {m.licence_url
                            ? <a href={m.licence_url} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-all whitespace-nowrap">📄 View</a>
                            : <span className="text-gray-300 text-xs">None</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(m.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-2 flex-wrap">
  <button onClick={() => onEdit(m)}
    className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-all border border-blue-100">
    ✏️ Edit
  </button>
  <a href={m.pdf_url || `${API_URL}/regenerate-pdf/${m.id}`} target="_blank" download>
    <button className="px-3 py-1 rounded-lg bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100 transition-all border border-green-100">
      📄 PDF
    </button>
  </a>
  <button onClick={() => setDeleteTarget(m)}
    className="px-3 py-1 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-all border border-red-100">
    🗑️ Delete
  </button>
</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="text-center mt-4 text-xs text-gray-400">
            Showing {filtered.length} of {members.length} members
          </div>
        </div>
      </div>

      {/* ── Delete Popup ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 max-w-sm w-full text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-2xl mx-auto mb-4">🗑️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Member?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete <strong>{deleteTarget.owner_name}</strong> — {deleteTarget.establishment_name}? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-50">
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Popup ── */}
    
    </>
  );
}