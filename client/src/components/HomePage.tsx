import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext"
import { useNavigate } from "react-router-dom";
import { 
    Box, 
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    TextField,
    Typography
} from "@mui/material"

// this is the home page main view, basically everything under the header bar in the homepage

export default function HomePage() {

    const { isLoggedIn, token } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [files, setFiles] = useState<any[]>([]);
    
    // for file renaming
    const [newName, setNewName] = useState('');
    const [renamingFile, setRenamingFile] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) fetchFiles();
    }, [isLoggedIn]);

    async function fetchFiles() {
        const res = await fetch('/api/user/foldercontent', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            const data = await res.json()
            if (res.ok) setFiles(data.files)
    }

    async function handleNewFile() {

        setLoading(true);
         
        try {
            const response = await fetch('/api/user/newfile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.message)
            }
            setFiles((prev:any) => [...prev, data ])
            //navigate(`/document/${data._id}`)
            
            
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Something went wrong");
            }
        } finally {
            setLoading(false)
        }
    }


    // Handler for the file deletion
    async function handleDelete(id: string) {

        try {
            const response = await fetch(`/api/user/file/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'Application/json',
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong!')
            }

            setFiles((prev: any) => prev.filter((file: any) => file._id !== id))
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Something went wrong");
            }
        }
    }

    //handler for filerename
    async function handleRename(id: string) {
        try {
            const response = await fetch(`/api/user/renamefile/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'Application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({name: newName})
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong!')
            }
            fetchFiles();
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Something went wrong");
            }
        } finally {
            setRenamingFile('');
            setNewName('');
        }
    }

    return (
        <>
            {!isLoggedIn && (
                <Typography> Log in or register to write documents! </Typography>
            )}
            { isLoggedIn && (
                <Box sx={{margin: '0 auto', maxWidth: 1000, px: 2, marginTop: '12px'}}>
                    <Button color='inherit' onClick={handleNewFile} disabled={loading}>{loading ? "Creating document..." : "Create document"}</Button>
                    {error && (
                        <Typography color="error" variant="body2" textAlign="center">
                            {error}
                        </Typography>
                    )}

                    {/* Grid for file cards */}
                    <Grid container direction="column" spacing={2} mt={2}>
                        {files.map((file: any) => (
                            <Grid /*size={{ xs: 12, sm: 6, md: 4}}*/ key={file._id}>
                                <Card sx={{ cursor: 'pointer' }} >

                                <CardContent onClick={() => navigate(`/document/${file._id}`)}>
                                    <Typography variant="h6">{file.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                    Created: {new Date(file.createdAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                    last update {new Date(file.updatedAt).toLocaleDateString()}
                                    </Typography>
                                </CardContent>
                                {/* shows the rename actions only for one file at a time */}
                                {file._id.toString() == renamingFile && (
                                    <>
                                        <TextField
                                            size="small"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            sx={{marginLeft: '10px'}}
                                        />
                                    </>
                                )}
                                <CardActions>
                                    <Button onClick={(e) => {e.stopPropagation(); handleDelete(file._id)}}>
                                        DELETE
                                    </Button>
                                    <Button onClick={() => {
                                        const isEditing = renamingFile === file._id;
                                        setRenamingFile(isEditing ? '' : file._id);
                                        setNewName('');
                                    }}>
                                        {renamingFile == '' ? 'RENAME' : 'CANCEL'}
                                    </Button>
                                    {file._id.toString() == renamingFile &&
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRename(file._id);
                                            }}
                                        >SAVE</Button>
                                    }
                                </CardActions>

                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

        </>
    )
}