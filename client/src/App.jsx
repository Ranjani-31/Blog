import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import About from "./pages/About";
import Home from "./pages/Home";
import BlogDetails from "./pages/BlogDetails";
import AdminDashboard from "./pages/AdminDashboard";
import NewPost from "./pages/NewPost";
import ThemeProvider from "./ThemeProvider";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp"

function AboutPage() {
  return (
    <>
      <Navbar />
      <About />
      <Footer />
    </>
  );
}

function ArticlePage() {
  return (
    <>
      <Navbar />
      <BlogDetails />
      <Footer />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<SignUp/>} />
          <Route path="/signin" element={<SignIn/>} />

          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/new" element={<NewPost />} />
          <Route path="/admin/edit/:slug" element={<NewPost />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
