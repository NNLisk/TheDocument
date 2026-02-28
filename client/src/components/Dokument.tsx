import { useParams } from "react-router-dom"
import { useAuth } from "./AuthContext"
import { useEffect, useRef, useState } from "react"
import { BtnBold, BtnBulletList, BtnItalic, BtnLink, BtnNumberedList, BtnStrikeThrough, BtnStyles, BtnUnderline, Editor, EditorProvider, Toolbar, type ContentEditableEvent } from "react-simple-wysiwyg"
import { Typography } from "@mui/material"

export default function DocumentPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [ html, setHtml ] = useState("");
  const [ statusMessage, setStatusMessage ] = useState("");
  const [loaded, setLoaded] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)



  function onChange(event: ContentEditableEvent) {
    setHtml(event.target.value);
    

    // timer so that it updates database if the user doesnt write for 2 seconds
    if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        await fetch(`/api/user/file/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: event.target.value })
      })
    }, 10000)
  }


  useEffect(() => {
    
    async function fetchFile() {

      try {
        const res = await fetch(`/api/user/file/${id}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.message);
        }
        setHtml(data.file.content || "")

      } catch (error) {
        if (error instanceof Error) {
                setStatusMessage(error.message);
            } else {
                setStatusMessage("Something went wrong");
            }
      } finally {
        setLoaded(true)

      }
      
    }
    fetchFile()
  }, [id])


  return (
    <EditorProvider>
      {statusMessage && (
        <Typography color="gray" variant="body2" textAlign="center">
          {statusMessage}
        </Typography>
      )}
      <Toolbar>

        <BtnBold />
        <BtnItalic />
        <BtnUnderline/>
        <BtnStrikeThrough/>
        <BtnBulletList/>
        <BtnNumberedList/>
        <BtnLink/>

        <BtnStyles/>

      </Toolbar>
      {loaded && <Editor key={id} value={html} onChange={onChange}/>}
    </EditorProvider> 
  )
  
}
  
