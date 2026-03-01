import { Box, AppBar, Toolbar, Typography, Button, IconButton, TextField} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { Link, useNavigate } from 'react-router-dom'
import { useState } from "react";

import { useAuth } from "./AuthContext";

export default function TopBar() {

    const { isLoggedIn, login, logout } = useAuth();
    const navigate = useNavigate();
    
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");

    const handleLogin = async () => {
        const res = await fetch("/api/user/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })
        
        const data = await res.json()
        if (res.ok) {
                login(data.token);
        }
    }
    
    
    return (
        <Box sx={{ flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: "none", color: "inherit"}}>
                        TypeWriter
                    </Typography>
                    {isLoggedIn && (
                        <Button color="inherit" onClick={() => {logout(); navigate('/')}}>Logout</Button>
                    )}
                    {!isLoggedIn && (
                        <>
                            <TextField variant="outlined" size="small" placeholder="Email"
                                sx={{ backgroundColor: "white", borderRadius: 1, mr: 1 }}
                                onChange={e => setEmail(e.target.value)} />
                            <TextField variant="outlined" size="small" placeholder="Password" type="password"
                                sx={{ backgroundColor: "white", borderRadius: 1, mr: 1 }}
                                onChange={e => setPassword(e.target.value)} />
                            <Button color="inherit" onClick={handleLogin}>Login</Button>
                            <Button color="inherit" component={Link} to="/register">Register</Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>
        </Box>
    )
}