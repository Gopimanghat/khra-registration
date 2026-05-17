import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'
import { exec } from 'child_process'
import fetch from 'node-fetch'


const app = express()
app.use(cors())
app.use(express.json())

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY


const upload = multer({ storage: multer.memoryStorage() })
const uploadFields = upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'licence', maxCount: 1 }])

app.post('/submit', uploadFields, async (req, res) => {
  try {
    const data = JSON.parse(req.body.data)

    const photoFile = req.files?.['photo']?.[0]
    const licenceFile = req.files?.['licence']?.[0]

    let photo_url = null
    let licence_url = null

    // Upload photo to Supabase Storage
    if (photoFile) {
      const fileName = `${Date.now()}_${photoFile.originalname}`
      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/photos/${fileName}`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': photoFile.mimetype,
          },
          body: photoFile.buffer,
        }
      )
      if (!uploadRes.ok) {
        const err = await uploadRes.text()
        throw new Error('Photo upload failed: ' + err)
      }
      photo_url = `${SUPABASE_URL}/storage/v1/object/public/photos/${fileName}`
    }

    // Upload licence to Supabase Storage
    if (licenceFile) {
      const licFileName = `${Date.now()}_${licenceFile.originalname}`
      const licUploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/licences/${licFileName}`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': licenceFile.mimetype,
          },
          body: licenceFile.buffer,
        }
      )
      if (!licUploadRes.ok) {
        const err = await licUploadRes.text()
        throw new Error('Licence upload failed: ' + err)
      }
      licence_url = `${SUPABASE_URL}/storage/v1/object/public/licences/${licFileName}`
    }

    // Insert member data into Supabase
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/members`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ ...data, photo_url, licence_url }),
    })

    if (!insertRes.ok) {
      const err = await insertRes.text()
      throw new Error('DB insert failed: ' + err)
    }

    const [member] = await insertRes.json()

    // Save photo locally for PDF generation
    let localPhotoPath = ''
    if (photoFile) {
      fs.mkdirSync('uploads', { recursive: true })
      localPhotoPath = `uploads/${Date.now()}_${photoFile.originalname}`
      fs.writeFileSync(localPhotoPath, photoFile.buffer)
    }

    // Generate filled PDF
    const outputPdf = `outputs/member_${member.id}.pdf`
    fs.mkdirSync('outputs', { recursive: true })

    const memberWithCombined = {
      ...member,
      phone_mobile: [member.phone, member.mobile].filter(Boolean).join(" / "),
    }
    const jsonData = JSON.stringify(memberWithCombined).replace(/"/g, '\\"')
    const cmd = `python api/fill_pdf.py "${jsonData}" "Primary_Membership_Form (1) (2).pdf" "${outputPdf}" "${localPhotoPath}"`

    exec(cmd, (err) => {
      if (err) console.error('PDF error:', err)
      else console.log(`PDF generated: ${outputPdf}`)
    })

    res.json({ success: true, id: member.id })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Download filled PDF
app.get('/pdf/:id', (req, res) => {
  const file = `outputs/member_${req.params.id}.pdf`
  if (fs.existsSync(file)) {
    res.download(file)
  } else {
    res.status(404).json({ error: 'PDF not found yet, please wait a moment.' })
  }
})


// Regenerate PDF for existing member
app.get('/regenerate-pdf/:id', async (req, res) => {
    try {
      const { id } = req.params
  
      // Fetch member from Supabase
      const fetchRes = await fetch(
        `${SUPABASE_URL}/rest/v1/members?id=eq.${id}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          }
        }
      )
      const members = await fetchRes.json()
      if (!members.length) return res.status(404).json({ error: 'Member not found' })
  
      const member = members[0]
      const outputPdf = `outputs/member_${member.id}.pdf`
      fs.mkdirSync('outputs', { recursive: true })
  
      // Download photo locally if exists
      let localPhotoPath = ''
      if (member.photo_url) {
        try {
          const photoRes = await fetch(member.photo_url)
          const buffer = Buffer.from(await photoRes.arrayBuffer())
          localPhotoPath = `uploads/temp_${member.id}.jpg`
          fs.mkdirSync('uploads', { recursive: true })
          fs.writeFileSync(localPhotoPath, buffer)
        } catch (e) {
          console.error('Photo download failed:', e)
        }
      }
  
      const memberWithCombined = {
        ...member,
        phone_mobile: [member.phone, member.mobile].filter(Boolean).join(" / "),
      }
      const jsonData = JSON.stringify(memberWithCombined).replace(/"/g, '\\"')
      const cmd = `python api/fill_pdf.py "${jsonData}" "Primary_Membership_Form (1) (2).pdf" "${outputPdf}" "${localPhotoPath}"`
  
      exec(cmd, (err) => {
        if (err) {
          console.error('PDF error:', err)
          return res.status(500).json({ error: 'PDF generation failed' })
        }
        res.download(outputPdf)
      })
  
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: err.message })
    }
  })

app.listen(3001, () => console.log('Server running on port 3001'))