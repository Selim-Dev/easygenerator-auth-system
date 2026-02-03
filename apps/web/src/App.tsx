import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signup" element={<div>Signup Page</div>} />
        <Route path="/signin" element={<div>Signin Page</div>} />
        <Route path="/app" element={<div>Protected App Page</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
