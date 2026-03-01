import { useParams } from "react-router-dom"
import { useAuth } from "./AuthContext"
import { useEffect, useRef, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import { Box, Button, TextField, Typography } from "@mui/material"
import html2pdf from "html2pdf.js";

// component renders the Tiptap wysiwyg and
// populates it with the content from the DB
// based on the parameter id from the route

export default function DocumentPage() {
    const { id } = useParams()
    const { token } = useAuth()
    const [statusMessage, setStatusMessage] = useState("")
    const [loaded, setLoaded] = useState(false)
    const [content, setContent] = useState('')

    // filesharing states
    const [isEditingAccess, setIsEditingAccess] = useState(false)
    const [emailToAccess, setEmailToAccess] = useState("")

    // savetimer
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      BulletList,
      OrderedList,
    ],
    content: "",
    onUpdate({ editor }) {

      const html = editor.getHTML()
      setContent(html)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        setStatusMessage('Saving...')

        const res = await fetch(`/api/user/file/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ content: html })
        })

        if (res.ok) {
            setStatusMessage('Content saved!')
        }
      }, 1000)
    }
  })

  async function giveAccessToFile() {


    try {
      const res = await fetch(`/api/user/giveAccessToFile/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'Application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({recipientEmail: emailToAccess})
      })

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatusMessage('File shared!')
    } catch (error) {
      if (error instanceof Error) setStatusMessage(error.message);
      else setStatusMessage("Something went wrong");
    }
  }

  useEffect(() => {
    async function fetchFile() {
      try {
        const res = await fetch(`/api/user/file/${id}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)
        editor?.commands.setContent(data.file.content || "")
      
    } catch (error) {
        if (error instanceof Error) setStatusMessage(error.message)
        else setStatusMessage("Something went wrong")
      } finally {
        setLoaded(true)
      }
    }
    fetchFile()
  }, [id, editor])

  function downloadFilePDF() {
    if (!editor) return;
    const element = document.createElement("div");
    element.innerHTML = content;

    const options = {
      filename: 'my-document.pdf',
      margin: 1,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    } as const;


    html2pdf().set(options).from(element).save();

  }

  if (!editor) return null

  return (
    <Box sx={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      margin: "0 auto",
      maxWidth: 1000,
      px: 2
    }}>
      {statusMessage && (
        <Typography color="gray" variant="body2" textAlign="left">
          {statusMessage}
        </Typography>
      )}

      
      {isEditingAccess && (
        <Box sx={{ mt: 2 }}>
          <TextField
          size="small"
          onChange={(e) => setEmailToAccess(e.target.value)}
          sx={{marginLeft: '16px'}}
          placeholder="Email of the recipient"
          />
          <Button onClick={giveAccessToFile}>Share</Button>
          <Button onClick={() => {setIsEditingAccess(false)}}>Cancel</Button>
        </Box>
      )}
      {!isEditingAccess && (
        <Box sx={{ mt: 2}}>
          <Button onClick={() => {setIsEditingAccess(true)}}>Share</Button>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <Button onClick={downloadFilePDF}>Download as PDF</Button>
      </Box>


      {/* Tiptap writing tools */}
      <Box sx={{ mb: 1 }}>
        <Button onClick={() => editor.chain().focus().toggleBold().run()}>B</Button>
        <Button onClick={() => editor.chain().focus().toggleItalic().run()}>I</Button>
        <Button onClick={() => editor.chain().focus().toggleUnderline().run()}>U</Button>
        <Button onClick={() => editor.chain().focus().toggleStrike().run()}>S</Button>
        <Button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</Button>
        <Button onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</Button>
        <Button onClick={() => editor.chain().focus().toggleLink({ href: "https://example.com" }).run()}>Link</Button>
      </Box>

      {/* tiptap editor */}
      <Box sx={{ flex: 1, display: 'flex' }}>
        {loaded && <EditorContent editor={editor} style={{ flex: 1, border: "1px solid #ccc", padding: "8px", borderRadius: 4 }} />}
      </Box>
    </Box>
  )
}