<Route 
  path="/doctors/profile/me" 
  element={
    <ProtectedRoute allowedRoles={['doctor']}>
      <DoctorAccount />
    </ProtectedRoute>
  } 
/> 