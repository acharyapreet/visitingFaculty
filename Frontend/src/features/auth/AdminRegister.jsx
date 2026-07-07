import React, { useState } from 'react';

const AdminRegister = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  
  // State to handle validation errors
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    // For the mobile field, only allow numbers to be typed
    if (e.target.name === 'mobile') {
      const onlyNums = e.target.value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, mobile: onlyNums });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    // Clear errors when the user starts typing again
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 1. Validate Mobile Number (Exactly 10 digits)
    if (formData.mobile.length !== 10) {
      setFormError('Mobile number must be exactly 10 digits.');
      return; // Stop the function here
    }

    // 2. Validate Password Length (Minimum 8 characters)
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    // 3. Validate Passwords Match
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match. Please try again.');
      return;
    }

    // If it passes all checks, clear any existing errors and proceed
    setFormError('');
    console.log("Validation Passed! Admin Registration Data:", formData);
    // Future: Add backend submit logic here
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] bg-[#F8F9FB] px-4 py-12">
      
      {/* Top Icon & Welcome Text */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 bg-[#004DD2] rounded-xl flex items-center justify-center shadow-md mb-4">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#141B2B]">Welcome To IIPS</h1>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-[520px] bg-white border border-[#C3C5D8] rounded-2xl p-8 shadow-sm">
        
        {/* Admin Portal Badge */}
        <div className="mx-auto w-fit bg-[#F1F3FF] border border-[#DBE1FF] text-[#004DD2] text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm mb-5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Admin Portal
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-[22px] font-bold text-[#141B2B] mb-1.5">Create Your Admin Account</h2>
          <p className="text-sm text-[#6B7280]">Enter your professional details to access the university dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Validation Error Banner */}
          {formError && (
            <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#EF4444] text-xs font-medium px-4 py-3 rounded-lg text-center mb-2">
              {formError}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-[#424656] mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input 
                type="text" 
                name="fullName"
                placeholder="Full Name" 
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border border-[#C3C5D8] rounded-lg pl-10 pr-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20 focus:border-[#004DD2] transition-colors"
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-[#424656] mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input 
                type="email" 
                name="email"
                placeholder="admin@davv.ac.in" 
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-[#C3C5D8] rounded-lg pl-10 pr-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20 focus:border-[#004DD2] transition-colors"
                required
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-[#424656] mb-1.5">Mobile Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input 
                type="tel" 
                name="mobile"
                placeholder="9876543210" 
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
                className="w-full border border-[#C3C5D8] rounded-lg pl-10 pr-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20 focus:border-[#004DD2] transition-colors"
                required
              />
            </div>
          </div>

          {/* Password Row */}
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#424656] mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input 
                  type="password" 
                  name="password"
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-[#C3C5D8] rounded-lg pl-10 pr-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20 focus:border-[#004DD2] transition-colors"
                  required
                />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#424656] mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-[#C3C5D8] rounded-lg pl-10 pr-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20 focus:border-[#004DD2] transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-[#004DD2] text-white font-medium rounded-lg py-3 mt-4 hover:bg-[#003bb3] focus:outline-none focus:ring-4 focus:ring-[#004DD2]/30 transition-all flex justify-center items-center gap-2"
          >
            Submit Registration
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-[#424656]">
            Already have an admin account?{' '}
            <button 
              onClick={() => onNavigate('login')}
              className="text-[#004DD2] font-semibold hover:underline focus:outline-none"
            >
              Sign In
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default AdminRegister;