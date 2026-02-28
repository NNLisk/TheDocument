import { useParams } from "react-router-dom"
import { useAuth } from "./AuthContext"
import { useEffect, useRef, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import { Box, Button, Typography } from "@mui/material"

export default function DocumentPage() {
    const { id } = useParams()
    const { token } = useAuth()
    const [statusMessage, setStatusMessage] = useState("")
    const [loaded, setLoaded] = useState(false)
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
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        setStatusMessage('Saving...')
        const response = await fetch(`/api/user/file/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ content: html })
        })

        if (response.ok) {
            setStatusMessage('Content saved!')
        }

      }, 1000)
    }
  })

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
        setStatusMessage('Content loaded')
      }
    }
    fetchFile()
  }, [id, editor])

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
        <Typography color="gray" variant="body2" textAlign="center">
          {statusMessage}
        </Typography>
      )}

      {/* toolbar */}
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