import { useState } from 'react'


import {
    Box,
    Button,
    TextField,
    Typography
} from '@mui/material'


export default function RegisterForm() {


    const [form, setForm] = useState({
        password: "",
        email: ""
    })
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };
  

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: form.password,
          email: form.email,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      
      console.log("Success:", data);

      setForm({password: "", email: ""});

    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("Something went wrong");
        }
    } finally {
      setLoading(false);
    }
  };

    return (
        <>
            <Box
                component='form'
                onSubmit={handleSubmit}
                sx={{
                    width: 300,
                    mx: "auto",
                    mt: 10,
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    boxShadow: 3,
                    borderRadius: 2,
                }}>
            <Typography variant="h6" textAlign="center">
                Register
            </Typography>

            <TextField
                label="Email"
                type='email'
                name='email'
                variant="outlined"
                fullWidth
                onChange={handleChange}
            />

            <TextField
                label="Password"
                type="password"
                name='password'
                variant="outlined"
                fullWidth
                onChange={handleChange}
            />

            {error && (
                <Typography color="error" variant="body2" textAlign="center">
                    {error}
                </Typography>
            )}

            <Button type='submit' variant="contained" fullWidth disabled={loading}>
                {loading ? "Signing Up..." : "Sign Up"}
            </Button>
            </Box>
        </>
    )
}