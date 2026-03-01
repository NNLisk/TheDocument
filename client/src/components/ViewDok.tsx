import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { Box, Button, TextField, Typography } from "@mui/material"

export default function ReadOnlyEditor() {

  const { code } = useParams();
  const [statusMessage, setStatusMessage] = useState("")
  const [loaded, setLoaded] = useState(false)

  
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      BulletList,
      OrderedList,
    ],
    content: "",
    editable: false,
  })

  useEffect(() => {
      if (!editor) return;
      async function fetchFile() {
        try {
          const res = await fetch(`/api/user/viewfilewithcode/${code}`, {
            method: 'GET',
            headers: { 
              'Content-Type': 'Application/json'
             }
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.message)
          editor?.commands.setContent(data.content || "")
      } catch (error) {
          if (error instanceof Error) setStatusMessage(error.message)
          else setStatusMessage("Something went wrong")
        } finally {
          setLoaded(true)
        }
      }
      fetchFile()
    }, [code, editor])

  if (!editor) return null

  return (
    
    <Box sx={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      margin: "0 auto",
      maxWidth: 1000,
      px: 2}}>

      
      {statusMessage && (
        <Typography color="gray" variant="body2" textAlign="center">
          {statusMessage}
        </Typography>
      )}

      <Box sx={{ flex: 1, display: 'flex' }}>
        {loaded && <EditorContent editor={editor} style={{ flex: 1, border: "1px solid #ccc", padding: "8px", borderRadius: 4 }} />}
      </Box>
    </Box>
  )
}