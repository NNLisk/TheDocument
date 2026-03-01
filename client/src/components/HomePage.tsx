import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext"
import { useNavigate } from "react-router-dom";
import { 
    Box, 
    Button,
    Card,
    CardActions,
    CardContent,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material"


type TFile = {
    _id: string,
    name: string,
    owner: string,
    parent: string | null,
    content: string,
    createdAt: Date | string,
    updatedAt: Date | string,
    shareCode: string,
}

// this is the home page main view, basically everything under the header bar in the homepage

export default function HomePage() {

    const { isLoggedIn, token } = useAuth();
    const [errorInfoMessage, setErrorInfoMessage] = useState("");

    // filestates
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<TFile[]>([]);
    const [shareCode, setShareCode] = useState("");
    
    // for file renaming
    const [newName, setNewName] = useState('');
    const [renamingFile, setRenamingFile] = useState('');

    const [sortOption, setSortOption] = useState("dateCreatedDesc");

    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) fetchFiles();
    }, [isLoggedIn]);

    async function fetchFiles() {
        const res = await fetch('/api/user/foldercontent', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            const data = await res.json()
            if (res.ok) {
                setFiles([
                    ...data.files,
                    ...data.filesWithEditRight
                ])
            }
    }

    async function handleNewFileCreation() {

        setIsLoading(true);
         
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
            setFiles((prev:TFile[]) => [...prev, data ])
            //navigate(`/document/${data._id}`)
            
            
        } catch (error) {
            if (error instanceof Error) {
                setErrorInfoMessage(error.message);
            } else {
                setErrorInfoMessage("Something went wrong");
            }
        } finally {
            setIsLoading(false)
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

            // i just refetch for this project
            fetchFiles();

        } catch (error) {
            if (error instanceof Error) {
                setErrorInfoMessage(error.message);
            } else {
                setErrorInfoMessage("Something went wrong");
            }
        }
    }

   
    async function handleFileRenaming(id: string) {
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
                throw new Error(data.message)
            }
            fetchFiles();
        } catch (error) {
            if (error instanceof Error) {
                setErrorInfoMessage(error.message);
            } else {
                setErrorInfoMessage("Something went wrong");
            }
        } finally {
            setRenamingFile('');
            setNewName('');
        }
    }

    async function requestFileShareCode(id: string) {

        try {
            const response = await fetch(`/api/user/createsharecode/${id}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'Application/json',
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }

            fetchFiles();

        } catch (error) {
            if (error instanceof Error) {
                setErrorInfoMessage(error.message);
            } else {
                setErrorInfoMessage("Something went wrong");
            }
        }
    }

    // creates a sorted list from the dropdown option
    const sortedFilesFromDropDown = [...files].sort((a, b) => {
        switch (sortOption) {
            case "dateCreatedAsc":
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case "dateCreatedDesc":
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case "nameAsc":
                return a.name.localeCompare(b.name);
            case "nameDesc":
                return b.name.localeCompare(a.name);
            default:
                return 0;
        }
    });
    
    return (
        <>
            {!isLoggedIn && (
                <Box sx={{mt: 2}}>
                    <Typography> Log in or register to write documents! </Typography>
                    <Typography>Or, if you have a sharecode, insert it here to view a file</Typography>
                    <TextField 
                        variant="outlined" 
                        size="small" 
                        placeholder="Sharecode" 
                        sx={{ backgroundColor: "white", borderRadius: 1, mr: 1}}
                        onChange={(e) => {setShareCode(e.target.value)}}
                    />
                    <Button color="inherit" onClick={() => {navigate(`/documentview/${shareCode}`)}}>View File</Button>

                </Box>
            )}
            { isLoggedIn && (
                <Box sx={{margin: '0 auto', maxWidth: 1000, px: 2, marginTop: '12px'}}>
                    <Button color='inherit' onClick={handleNewFileCreation} disabled={isLoading}>{isLoading ? "Creating document..." : "Create document"}</Button>

                    <FormControl size="small" sx={{ minWidth: 200, mt: 2 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sortOption}
                            label="Sort By"
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <MenuItem value="dateCreatedDesc">Newest First</MenuItem>
                            <MenuItem value="dateCreatedAsc">Oldest First</MenuItem>
                            <MenuItem value="nameAsc">Name (A-Z)</MenuItem>
                            <MenuItem value="nameDesc">Name (Z-A)</MenuItem>
                        </Select>
                    </FormControl>
                    {errorInfoMessage && (
                        <Typography color="error" variant="body2" textAlign="center">
                            {errorInfoMessage}
                        </Typography>
                    )}

                    {/* Grid for file cards */}
                    <Grid container direction="column" spacing={2} mt={2}>
                        {sortedFilesFromDropDown.map((file: TFile) => (
                            <Grid /*size={{ xs: 12, sm: 6, md: 4}}*/ key={file._id}>
                                <Card sx={{ cursor: 'pointer' }} >

                                <CardContent onClick={() => navigate(`/document/${file._id}`)}>
                                    <Typography variant="h6">{file.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                    Created: {new Date(file.createdAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                    Last Update {new Date(file.updatedAt).toLocaleDateString()}
                                    </Typography>
                                    
                                </CardContent>
                                {/* shows the rename actions only for one file at a time */}
                                {file.shareCode && (
                                    <Typography variant="body2" color="text.secondary" sx={{marginLeft: '16px'}}>
                                        ShareCode: {file.shareCode}
                                    </Typography>
                                )}
                                {file._id.toString() == renamingFile && (
                                    <>
                                        <TextField
                                            size="small"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            sx={{marginLeft: '16px'}}
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
                                                handleFileRenaming(file._id);
                                            }}
                                        >SAVE</Button>
                                    }
                                    <Button onClick={(e) => {e.stopPropagation(); requestFileShareCode(file._id);}}>Create sharecode</Button>
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