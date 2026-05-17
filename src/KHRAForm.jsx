import { useState } from "react";
const API_URL = "https://YOUR-RENDER-URL.onrender.com"

const SUPABASE_URL = "https://vjcavgqmphoremcwybmk.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqY2F2Z3FtcGhvcmVtY3d5Ym1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NjQyMDEsImV4cCI6MjA5NDU0MDIwMX0.78WLXqWDpaBYrWzRpyeYDoV2C-ixRRaWs2kAioqlO6g"

const DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
  "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad",
  "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

const ESTABLISHMENT_TYPES = [
  "Hotel", "Restaurant", "Tourist Home", "Tea Shop",
  "Bakery", "Fast Food Service", "Food Production"
];

const ROLES = [
  "Licencee", "Managing Director", "Managing Partner",
  "Partner", "General Manager"
];

const AC_OPTIONS = ["AC", "Partial AC", "Non-AC"];
const RESTAURANT_TYPES = ["Veg", "Non-Veg"];

const STEPS = [
  { label: "Establishment", ml: "സ്ഥാപനം", icon: "🏨" },
  { label: "Owner", ml: "ഉടമസ്ഥൻ", icon: "👤" },
  { label: "Nature", ml: "സ്വഭാവം", icon: "📋" },
  { label: "Lodge/Rest.", ml: "ലോഡ്ജ്", icon: "🍽️" },
  { label: "Photo", ml: "ഫോട്ടോ", icon: "📷" },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-between px-1 mb-6">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center min-w-0">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold transition-all duration-300
                ${done ? "bg-green-500 text-white shadow-md shadow-green-200"
                  : active ? "bg-orange-500 text-white shadow-md shadow-orange-200 scale-110"
                  : "bg-gray-100 text-gray-400"}`}>
                {done ? "✓" : step.icon}
              </div>
              <div className={`mt-1 text-center hidden sm:block ${active ? "text-orange-500 font-semibold" : done ? "text-green-500" : "text-gray-400"}`}>
                <div className="text-xs leading-tight">{step.label}</div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 sm:mx-2 mb-4 sm:mb-5 transition-all duration-500 ${done ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FieldLabel({ en, ml, optional }) {
  return (
    <div className="mb-2">
      <div className="text-sm font-semibold text-gray-800">{ml}</div>
      <div className="text-xs text-gray-400">{en}{optional && <span className="text-orange-400"> (Optional)</span>}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", maxLength }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-white text-gray-800 text-sm focus:outline-none focus:border-orange-400 transition-all placeholder-gray-300"
    />
  );
}

function Textarea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-white text-gray-800 text-sm focus:outline-none focus:border-orange-400 transition-all placeholder-gray-300 resize-none"
    />
  );
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-white text-gray-800 text-sm focus:outline-none focus:border-blue-400 transition-all appearance-none cursor-pointer"
    >
      {children}
    </select>
  );
}

function ChipGroup({ options, selected, onChange, color = "orange" }) {
  const toggle = (opt) => {
    const next = selected.includes(opt)
      ? selected.filter(x => x !== opt)
      : [...selected, opt];
    onChange(next);
  };
  const activeClass = color === "orange"
    ? "bg-orange-500 text-white border-orange-500"
    : "bg-purple-500 text-white border-purple-500";
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => toggle(opt)}
          className={`px-3 py-2 rounded-full text-sm border-2 font-medium transition-all
            ${selected.includes(opt) ? activeClass : "bg-white text-gray-500 border-gray-200 hover:border-orange-300"}`}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function RadioChip({ options, selected, onChange, color = "blue" }) {
  const activeClass = color === "blue"
    ? "bg-blue-500 text-white border-blue-500"
    : "bg-green-500 text-white border-green-500";
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={`px-3 py-2 rounded-full text-sm border-2 font-medium transition-all
            ${selected === opt ? activeClass : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"}`}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function SectionCard({ title, ml, icon, color, children }) {
  const styles = {
    orange: { card: "border-orange-100", head: "bg-orange-50 border-orange-100", icon: "bg-orange-500", title: "text-orange-700" },
    blue:   { card: "border-blue-100",   head: "bg-blue-50 border-blue-100",     icon: "bg-blue-500",   title: "text-blue-700" },
    purple: { card: "border-purple-100", head: "bg-purple-50 border-purple-100", icon: "bg-purple-500", title: "text-purple-700" },
    green:  { card: "border-green-100",  head: "bg-green-50 border-green-100",   icon: "bg-green-500",  title: "text-green-700" },
    pink:   { card: "border-pink-100",   head: "bg-pink-50 border-pink-100",     icon: "bg-pink-500",   title: "text-pink-700" },
  };
  const s = styles[color];
  return (
    <div className={`rounded-2xl border ${s.card} overflow-hidden mb-5 shadow-sm`}>
      <div className={`flex items-center gap-3 px-5 py-3 border-b ${s.head}`}>
        <div className={`w-8 h-8 rounded-lg ${s.icon} flex items-center justify-center text-white text-base flex-shrink-0`}>{icon}</div>
        <div>
          <div className={`font-bold text-sm ${s.title}`}>{title}</div>
          <div className="text-xs text-gray-400">{ml}</div>
        </div>
      </div>
      <div className="px-4 py-4 sm:px-5 bg-white space-y-4">
        {children}
      </div>
    </div>
  );
}

function NavButtons({ step, totalSteps, onBack, onNext, onSubmit, submitting, isEditMode }) {
  return (
    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 gap-3">
      {step > 0 ? (
        <button onClick={onBack}
          className="flex-1 sm:flex-none px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all">
          ← Back
        </button>
      ) : <div />}
      {step < totalSteps - 1 ? (
        <button onClick={onNext}
          className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-all shadow-md shadow-orange-100">
          Next →
        </button>
      ) : (
        <button onClick={onSubmit} disabled={submitting}
          className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-all shadow-md shadow-green-100 disabled:opacity-50">
          {submitting ? "Saving…" : isEditMode ? "💾 Save Changes" : "✓ Submit Registration"}
        </button>
      )}
    </div>
  );
}

export default function KHRAForm({ onAdminClick, editData, onEditDone }) {
  const isEditMode = !!editData;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => editData ? {
    ...editData,
    photo: null,
    licence: null,
  } : {
    owner_name: "", establishment_name: "", establishment_address: "",
    building_number: "", ward: "", post_office: "", taluk: "", district: "",
    pincode: "", phone: "", mobile: "", email: "", licence_receipt_number: "",
    fssai_licence: "", owner_address: "", year_established: "",
    establishment_type: [], role: [], ac_status: "", lodge_rooms: "",
    restaurant_type: [], seating_capacity: "", photo: null, licence: null,
  });

  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [memberId, setMemberId] = useState(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validateStep = () => {
    if (step === 0 && (!form.owner_name || !form.establishment_name || !form.district)) {
      setErrorMsg("Please fill Owner Name, Establishment Name, and District.");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };
  const handleBack = () => { setErrorMsg(""); setStep(s => s - 1); };

  const handleSubmit = async () => {
    setStatus("submitting");
    setErrorMsg("");
    try {
      if (isEditMode) {
        const { photo, licence, photo_url, licence_url, created_at, id, ...rest } = form;
        const updateRes = await fetch(
          `https://vjcavgqmphoremcwybmk.supabase.co/rest/v1/members?id=eq.${editData.id}`,
          {
            method: 'PATCH',
            headers: {
              "apikey": SUPABASE_ANON_KEY,
              "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(rest),
          }
        );
        if (!updateRes.ok) throw new Error(await updateRes.text());
        setStatus("success");
      } else {
        const formData = new FormData();
        const { photo, licence, ...rest } = form;
        formData.append("data", JSON.stringify(rest));
        if (photo) formData.append("photo", photo);
        if (licence) formData.append("licence", licence);

        const res = await fetch("${API_URL}/submit", {
          method: "POST",
          body: formData,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Submission failed");
        setMemberId(result.id);
        setStatus("success");
      }
    } catch (err) {
      setErrorMsg("Failed: " + err.message);
      setStatus("error");
    }
  };

  const resetForm = () => {
    setForm({
      owner_name: "", establishment_name: "", establishment_address: "",
      building_number: "", ward: "", post_office: "", taluk: "", district: "",
      pincode: "", phone: "", mobile: "", email: "", licence_receipt_number: "",
      fssai_licence: "", owner_address: "", year_established: "",
      establishment_type: [], role: [], ac_status: "", lodge_rooms: "",
      restaurant_type: [], seating_capacity: "", photo: null, licence: null,
    });
    setStep(0);
    setStatus("idle");
    setMemberId(null);
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-4xl text-white mx-auto mb-5 shadow-lg shadow-green-200">✓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isEditMode ? "Member Updated!" : "Registration Submitted!"}
          </h2>
          <p className="text-gray-500 mb-1">
            {isEditMode ? "Changes saved successfully." : <>Member ID: <span className="font-bold text-orange-500">#{memberId}</span></>}
          </p>
          <p className="text-gray-400 mb-6 text-sm">{form.establishment_name}</p>
          <a href={isEditMode
    ? `${API_URL}/regenerate-pdf/${editData?.id}`
    : `${API_URL}/pdf/${memberId}`}
  target="_blank" download>
  <button className="w-full mb-3 px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all shadow-md shadow-orange-100">
    📄 Download Filled PDF
  </button>
</a>
          <button
            className="w-full px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
            onClick={() => isEditMode ? onEditDone() : resetForm()}
          >
            {isEditMode ? "← Back to Admin" : "+ Register Another"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-200 flex-shrink-0">K</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-800 text-sm leading-tight truncate">KHRA Primary Membership</div>
            <div className="text-xs text-orange-500 truncate">പ്രാഥമിക അംഗത്വ അപേക്ഷ</div>
          </div>
          {onAdminClick && !isEditMode && (
            <button onClick={onAdminClick}
              className="px-3 py-1.5 rounded-lg bg-gray-800 text-white text-xs font-semibold hover:bg-gray-700 transition-all flex-shrink-0">
              Admin
            </button>
          )}
          {isEditMode && (
            <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100 flex-shrink-0">
              ✏️ Edit Mode
            </span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 pb-10">

        {/* Step Indicator */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 pt-4 pb-2 mb-4">
          <StepIndicator current={step} />
          <div className="text-center text-xs text-gray-400 pb-2">
            Step {step + 1} of {STEPS.length} — {STEPS[step].ml} / {STEPS[step].label}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">

          {/* STEP 1 — Establishment Details */}
          {step === 0 && (
            <SectionCard title="Establishment Details" ml="സ്ഥാപനത്തിന്റെ വിവരങ്ങൾ" icon="🏨" color="orange">
              <div>
                <FieldLabel en="Owner / Partner Name" ml="ഉടമസ്ഥന്റെ / പങ്കാളിയുടെ പേര്" />
                <Input value={form.owner_name} onChange={e => set("owner_name", e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <FieldLabel en="Establishment Name" ml="സ്ഥാപനത്തിന്റെ പേര്" />
                <Input value={form.establishment_name} onChange={e => set("establishment_name", e.target.value)} placeholder="Name of hotel / restaurant" />
              </div>
              <div>
                <FieldLabel en="Establishment Address" ml="സ്ഥാപനത്തിന്റെ വിലാസം" />
                <Textarea value={form.establishment_address} onChange={e => set("establishment_address", e.target.value)} placeholder="Full address" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel en="Building Number" ml="കെട്ടിട നമ്പർ" />
                  <Input value={form.building_number} onChange={e => set("building_number", e.target.value)} />
                </div>
                <div>
                  <FieldLabel en="Ward" ml="വാർഡ്" />
                  <Input value={form.ward} onChange={e => set("ward", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel en="Post Office" ml="പോസ്റ്റ് ഓഫീസ്" />
                  <Input value={form.post_office} onChange={e => set("post_office", e.target.value)} />
                </div>
                <div>
                  <FieldLabel en="Taluk" ml="താലൂക്ക്" />
                  <Input value={form.taluk} onChange={e => set("taluk", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel en="District" ml="ജില്ല" />
                  <Select value={form.district} onChange={e => set("district", e.target.value)}>
                    <option value="">Select district</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </div>
                <div>
                  <FieldLabel en="PIN Code" ml="പിൻകോഡ്" />
                  <Input value={form.pincode} onChange={e => set("pincode", e.target.value)} placeholder="6-digit PIN" maxLength={6} />
                </div>
              </div>
              {/* Phone, Mobile, Email — stacked on mobile */}
              <div>
                <FieldLabel en="Phone" ml="ഫോൺ" />
                <Input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="Landline number" />
              </div>
              <div>
                <FieldLabel en="Mobile" ml="മൊബൈൽ" />
                <Input type="tel" value={form.mobile} onChange={e => set("mobile", e.target.value)} placeholder="Mobile number" />
              </div>
              <div>
                <FieldLabel en="Email" ml="ഇ-മെയിൽ" optional />
                <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@example.com" />
              </div>
              <div>
                <FieldLabel en="Corporation / Municipality / Panchayath — Licence No. / Receipt No." ml="കോർപ്പറേഷൻ / മുനിസിപ്പാലിറ്റി / പഞ്ചായത്ത്" />
                <Input value={form.licence_receipt_number} onChange={e => set("licence_receipt_number", e.target.value)} />
              </div>
              <div>
                <FieldLabel en="FSSAI Licence Number" ml="എഫ്.എസ്.എസ്.എ. ലൈസൻസ് നമ്പർ" />
                <Input value={form.fssai_licence} onChange={e => set("fssai_licence", e.target.value)} />
              </div>
            </SectionCard>
          )}

          {/* STEP 2 — Owner */}
          {step === 1 && (
            <>
              <SectionCard title="Owner's Address" ml="ഉടമസ്ഥന്റെ വിലാസം" icon="👤" color="blue">
                <div>
                  <FieldLabel en="Residential address of owner" ml="ഉടമസ്ഥന്റെ വിലാസം" />
                  <Textarea value={form.owner_address} onChange={e => set("owner_address", e.target.value)} placeholder="Residential address" />
                </div>
              </SectionCard>
              <SectionCard title="Year of Establishment" ml="സ്ഥാപനം ആരംഭിച്ച വർഷം" icon="📅" color="green">
                <div>
                  <FieldLabel en="Year of Establishment" ml="സ്ഥാപനം ആരംഭിച്ച വർഷം" />
                  <Input type="number" value={form.year_established} onChange={e => set("year_established", e.target.value)} placeholder="e.g. 2005" />
                </div>
              </SectionCard>
            </>
          )}

          {/* STEP 3 — Nature */}
          {step === 2 && (
            <SectionCard title="Nature of Establishment" ml="സ്ഥാപനത്തിന്റെ സ്വഭാവം" icon="📋" color="purple">
              <div>
                <FieldLabel en="Type of Establishment" ml="സ്ഥാപനത്തിന്റെ തരം" />
                <ChipGroup options={ESTABLISHMENT_TYPES} selected={form.establishment_type} onChange={v => set("establishment_type", v)} color="orange" />
              </div>
              <div>
                <FieldLabel en="Role / Designation" ml="ലൈസൻസി / സ്ഥാനം" />
                <ChipGroup options={ROLES} selected={form.role} onChange={v => set("role", v)} color="orange" />
              </div>
              <div>
                <FieldLabel en="Air Conditioning" ml="ശീതീകരണം" />
                <RadioChip options={AC_OPTIONS} selected={form.ac_status} onChange={v => set("ac_status", v)} color="blue" />
              </div>
            </SectionCard>
          )}

          {/* STEP 4 — Lodge / Restaurant */}
          {step === 3 && (
            <SectionCard title="Lodge / Restaurant Details" ml="ലോഡ്ജ് / റസ്റ്റോറന്റ്" icon="🍽️" color="pink">
              <div>
                <FieldLabel en="(A) Number of Lodge Rooms" ml="(എ) ലോഡ്ജ് മുറികളുടെ എണ്ണം" />
                <Input type="number" value={form.lodge_rooms} onChange={e => set("lodge_rooms", e.target.value)} placeholder="0" />
              </div>
              <div>
                <FieldLabel en="Seating Capacity" ml="സീറ്റിംഗ് സൗകര്യം" />
                <Input type="number" value={form.seating_capacity} onChange={e => set("seating_capacity", e.target.value)} placeholder="0" />
              </div>
              <div>
                <FieldLabel en="(B) Restaurant Type" ml="(ബി) റസ്റ്റോറന്റ്" />
                <RadioChip options={RESTAURANT_TYPES} selected={form.restaurant_type?.[0] || ""} onChange={v => set("restaurant_type", [v])} color="blue" />
              </div>
            </SectionCard>
          )}

          {/* STEP 5 — Photo & Licence */}
          {step === 4 && (
            <SectionCard title="Photo & Licence" ml="ഫോട്ടോ & ലൈസൻസ്" icon="📷" color="green">

              {/* Passport Photo */}
              <div>
                <FieldLabel en="Passport Photo (Camera or File)" ml="പാസ്പോർട്ട് ഫോട്ടോ" />
                <div className="flex gap-2 mb-3">
                  <label className="flex-1 flex flex-col items-center justify-center gap-1 py-4 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 cursor-pointer hover:border-orange-400 transition-all">
                    <span className="text-2xl">📁</span>
                    <span className="text-xs text-orange-600 font-medium">Upload File</span>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => set("photo", e.target.files[0] || null)} />
                  </label>
                  <label className="flex-1 flex flex-col items-center justify-center gap-1 py-4 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 cursor-pointer hover:border-blue-400 transition-all">
                    <span className="text-2xl">📸</span>
                    <span className="text-xs text-blue-600 font-medium">Take Photo</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden"
                      onChange={e => set("photo", e.target.files[0] || null)} />
                  </label>
                </div>
                {form.photo && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                    <img src={URL.createObjectURL(form.photo)} alt="preview"
                      className="w-14 h-18 object-cover rounded-lg border border-green-200" style={{height:72}} />
                    <div>
                      <div className="text-sm font-semibold text-green-700">Photo selected ✓</div>
                      <div className="text-xs text-green-500 mt-0.5 truncate max-w-[180px]">{form.photo.name}</div>
                      <button onClick={() => set("photo", null)} className="text-xs text-red-400 mt-1 hover:text-red-600">Remove</button>
                    </div>
                  </div>
                )}
                {editData?.photo_url && !form.photo && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                    <img src={editData.photo_url} alt="current" className="w-14 object-cover rounded-lg border" style={{height:72}} />
                    <div>
                      <div className="text-xs text-gray-500">Current photo (upload new to replace)</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Licence Upload */}
              <div>
                <FieldLabel en="Licence Document (Camera or File)" ml="ലൈസൻസ് രേഖ" optional />
                <div className="flex gap-2 mb-3">
                  <label className="flex-1 flex flex-col items-center justify-center gap-1 py-4 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 cursor-pointer hover:border-orange-400 transition-all">
                    <span className="text-2xl">📁</span>
                    <span className="text-xs text-orange-600 font-medium">Upload File</span>
                    <input type="file" accept="image/*,application/pdf" className="hidden"
                      onChange={e => set("licence", e.target.files[0] || null)} />
                  </label>
                  <label className="flex-1 flex flex-col items-center justify-center gap-1 py-4 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 cursor-pointer hover:border-blue-400 transition-all">
                    <span className="text-2xl">📸</span>
                    <span className="text-xs text-blue-600 font-medium">Take Photo</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden"
                      onChange={e => set("licence", e.target.files[0] || null)} />
                  </label>
                </div>
                {form.licence && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="text-2xl">📄</div>
                    <div>
                      <div className="text-sm font-semibold text-green-700">Licence selected ✓</div>
                      <div className="text-xs text-green-500 mt-0.5 truncate max-w-[180px]">{form.licence.name}</div>
                      <button onClick={() => set("licence", null)} className="text-xs text-red-400 mt-1 hover:text-red-600">Remove</button>
                    </div>
                  </div>
                )}
                {editData?.licence_url && !form.licence && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                    <div className="text-2xl">📄</div>
                    <div>
                      <div className="text-xs text-gray-500">Licence already uploaded</div>
                      <a href={editData.licence_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">View current</a>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              ⚠️ {errorMsg}
            </div>
          )}

          <NavButtons
            step={step}
            totalSteps={STEPS.length}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
            submitting={status === "submitting"}
            isEditMode={isEditMode}
          />
        </div>
      </div>
    </div>
  );
}