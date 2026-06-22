// config.js
// PENTING: Jangan pernah mempublikasikan API key ke repository publik (seperti GitHub)
// Untuk produksi, gunakan environment variables di sisi server.

const CONFIG = {
    // API Key Groq untuk AI Identification
    GROQ_API_KEY: "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",
    
    // Model Vision Groq yang digunakan untuk identifikasi gambar
    // Pilihan: "meta-llama/llama-4-scout-17b-16e-instruct" atau "qwen/qwen3.6-27b"
    GROQ_VISION_MODEL: "meta-llama/llama-4-scout-17b-16e-instruct",
    
    // Supabase Configuration
    SUPABASE_URL: "https://zwnfcsdnrdhdaybqxhqt.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bmZjc2RucmRoZGF5YnF4aHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NzI2MTAsImV4cCI6MjA5NzQ0ODYxMH0.kJr-8wrgtrcjlT-F1zXEXq7Ad7KN-1KzMGBmqN47qM4"
};
