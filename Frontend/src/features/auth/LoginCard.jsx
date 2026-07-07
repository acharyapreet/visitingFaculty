import React, { useState } from 'react';

const LoginCard = ({ onNavigate }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successRole, setSuccessRole] = useState(null);
  
  // NEW: Loading state to disable the button while waiting for the Node.js backend
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // 1. Send the credentials to your teammate's Node.js API endpoint
      // (You will need to update 'http://localhost:5000/api/login' to whatever URL your teammate uses)
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: userId, 
          password: password 
        }),
      });

      const data = await response.json();

      // 2. Check the response from the backend
      if (response.ok) {
        // Assuming the backend sends back an object like: { success: true, role: 'Faculty', token: 'xyz...' }
        setSuccessRole(data.role);
        
        // Optional: Save the login token to localStorage so the user stays logged in
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
      } else {
        // If the backend says unauthorized (401), show the error message from the database
        setErrorMessage(data.message || 'Invalid credentials. Please check your details and try again.');
      }
    } catch (error) {
      // This catches network errors (e.g., if the Node.js server isn't running yet)
      console.error("Login error:", error);
      setErrorMessage("Could not connect to the server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* SUCCESS MODAL OVERLAY */}
      {successRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141B2B]/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center border border-[#C3C5D8] animate-in fade-in zoom-in duration-200">
            
            {/* Green Checkmark Icon */}
            <div className="w-16 h-16 bg-[#E1FDEB] text-[#10B981] rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-[#141B2B] mb-2">Login Successful</h3>
            
            <p className="text-[#585F6C] text-sm mb-8 leading-relaxed">
              Welcome back! You have successfully authenticated to the IIPS portal as a <span className="font-bold text-[#004DD2]">{successRole}</span>.
            </p>
            
            <button
              onClick={() => {
                setSuccessRole(null); 
                setUserId('');
                setPassword('');
                // ADD ROUTING HERE LATER (e.g., navigate to /dashboard)
              }}
              className="w-full bg-[#004DD2] text-white font-medium rounded-lg py-3 hover:bg-[#003bb3] focus:outline-none focus:ring-4 focus:ring-[#004DD2]/30 transition-all shadow-md"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* MAIN LOGIN PAGE CONTENT */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] bg-[#F8F9FB] px-4 py-12">
        
        {/* Top Icon & Welcome Text */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-[#004DD2] rounded-xl flex items-center justify-center shadow-md mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#141B2B]">Welcome Back</h1>
        </div>

        {/* Main Login Card */}
        <div className="w-full max-w-[480px] bg-white border border-[#C3C5D8] rounded-2xl p-8 shadow-sm">
          
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#141B2B] mb-1">Sign In to Your Account</h2>
            <p className="text-sm text-[#6B7280]">Please fill in the details</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            
            {/* Conditional Error Banner */}
            {errorMessage && (
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#EF4444] text-xs font-medium px-4 py-3 rounded-lg text-center mb-2">
                {errorMessage}
              </div>
            )}

            {/* Institute User ID Input */}
            <div>
              <label className="block text-sm font-medium text-[#424656] mb-1.5">Institute User ID</label>
              <input 
                type="text" 
                placeholder="IIPS-2K26-002" 
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setErrorMessage('');
                }}
                disabled={isLoading}
                className={`w-full border rounded-lg px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 transition-colors ${
                  errorMessage 
                    ? 'border-[#EF4444] focus:ring-[#EF4444]/20 focus:border-[#EF4444]' 
                    : 'border-[#C3C5D8] focus:ring-[#004DD2]/20 focus:border-[#004DD2]'
                } ${isLoading ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'}`}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-[#424656] mb-1.5">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                disabled={isLoading}
                className={`w-full border rounded-lg px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 transition-colors ${
                  errorMessage 
                    ? 'border-[#EF4444] focus:ring-[#EF4444]/20 focus:border-[#EF4444]' 
                    : 'border-[#C3C5D8] focus:ring-[#004DD2]/20 focus:border-[#004DD2]'
                } ${isLoading ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'}`}
                required
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full text-white font-medium rounded-lg py-3 mt-2 focus:outline-none focus:ring-4 focus:ring-[#004DD2]/30 transition-all flex justify-center items-center ${
                isLoading ? 'bg-[#004DD2]/70 cursor-not-allowed' : 'bg-[#004DD2] hover:bg-[#003bb3]'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center mt-5 mb-8">
            <button 
              type="button" 
              className="text-sm font-bold text-[#004DD2] hover:underline focus:outline-none"
            >
              Forget Password ?
            </button>
          </div>

          {/* Registration Section */}
          <div className="flex flex-col items-start">
            <p className="text-xs font-bold text-[#004DD2] mb-3 ml-1">Don't Have an Account ?</p>
            <button 
              type="button" 
              onClick={() => onNavigate('role-selection')}
              className="w-full bg-[#004DD2] text-white font-medium rounded-lg py-3 hover:bg-[#003bb3] focus:outline-none focus:ring-4 focus:ring-[#004DD2]/30 transition-all"
            >
              Register Now
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default LoginCard;