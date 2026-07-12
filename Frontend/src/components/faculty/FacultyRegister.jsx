import { useState } from 'react';
import { registerFaculty } from '../../api/authApi';

const initialFormState = {
  full_name: '',
  phone_number: '',
  email: '',
  address: '',
  qualification: '',
  aadhaar_no: '',
  pan_card_no: '',
  bank_name: '',
  account_no: '',
  ifsc_code: '',
  password: '',
  confirmPassword: '',
};

export default function Register({ onNavigate, onRegistrationSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormState);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const progressWidth = step === 1 ? '36%' : '100%';

  const handleChange = (event) => {
    const { name, value } = event.target;
    const sanitizedValue =
      name === 'phone_number' || name === 'aadhaar_no' || name === 'account_no'
        ? value.replace(/[^0-9]/g, '')
        : name === 'ifsc_code'
          ? value.toUpperCase().replace(/[^A-Z0-9]/g, '')
          : value;

    setFormData((current) => ({
      ...current,
      [name]: sanitizedValue,
    }));

    setSubmitError('');
  };

  const validateStepOne = () => {
    if (!formData.full_name.trim()) return 'Please enter your full name.';
    if (!/^[0-9]{10}$/.test(formData.phone_number.trim())) return 'Phone number must be 10 digits.';
    if (!formData.email.trim()) return 'Please enter your email address.';
    if (!formData.address.trim()) return 'Please enter your address.';
    return '';
  };

  const validateStepTwo = () => {
    if (!formData.qualification.trim()) return 'Please select your highest qualification.';
    if (!/^[0-9]{12}$/.test(formData.aadhaar_no.trim())) return 'Aadhaar number must be 12 digits.';
    if (!/^[A-Z0-9]{10}$/.test(formData.pan_card_no.trim().toUpperCase())) return 'PAN number must be 10 alphanumeric characters.';
    if (!formData.bank_name.trim()) return 'Please enter your bank name.';
    if (!formData.account_no.trim()) return 'Please enter your account number.';
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code.trim().toUpperCase())) return 'IFSC code must be 11 characters.';
    if (formData.password.length < 8) return 'Password must be at least 8 characters long.';
    if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(formData.password)) return 'Password must include letters and numbers.';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match. Please try again.';
    return '';
  };

  const handleNext = (event) => {
    event.preventDefault();
    const validationMessage = validateStepOne();

    if (validationMessage) {
      setSubmitError(validationMessage);
      return;
    }

    setStep(2);
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateStepTwo();
    if (validationMessage) {
      setSubmitError(validationMessage);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const payload = {
      full_name: formData.full_name.trim(),
      phone_number: formData.phone_number.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      qualification: formData.qualification.trim(),
      aadhaar_no: formData.aadhaar_no.trim(),
      pan_card_no: formData.pan_card_no.trim().toUpperCase(),
      bank_name: formData.bank_name.trim(),
      account_no: formData.account_no.trim(),
      ifsc_code: formData.ifsc_code.trim().toUpperCase(),
      password: formData.password,
    };

    try {
      const response = await registerFaculty(payload);
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      const registeredData = data.data;

      setSuccessData({
        instituteUserId: registeredData.user_id,
        fullName: registeredData.full_name,
        email: registeredData.email,
      });

      if (typeof onRegistrationSuccess === 'function') {
        onRegistrationSuccess(registeredData);
      }

      setStep(3);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || 
        error.message || 
        'Unable to complete faculty registration.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 3 && successData) {
    return (
      <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[#F8F9FB] px-3 py-8 sm:px-4 sm:py-12">
        <div className="w-full max-w-[420px] rounded-2xl border border-[#C3C5D8] bg-white px-6 py-8 text-center shadow-sm sm:px-8 sm:py-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF1FF] text-[#004DD2] shadow-sm">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-[#141B2B]">Registration Submitted!</h2>
          <p className="mt-4 text-sm leading-6 text-[#6B7280]">
            Thank you, {successData.fullName}. Your registration details have been sent to the administration for review.
          </p>

          <div className="mt-6 rounded-xl bg-[#EEF3FF] px-5 py-4 text-sm text-[#424656]">
            Your account is currently <span className="font-bold text-[#EF4444]">Pending Approval</span>. 
            Once an Administrator verifies and approves your account, you will be able to log in.
            <div className="mt-4 border-t border-[#C3C5D8]/50 pt-3">
              <span className="text-xs text-[#6B7280]">Your assigned User ID is:</span>
              <div className="mt-1 font-semibold text-[#004DD2]">{successData.instituteUserId}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('faculty-login', { initialUserId: successData.instituteUserId })}
            className="mt-8 w-full rounded-lg bg-[#004DD2] py-3 font-medium text-white shadow-md transition hover:bg-[#003bb3]"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#F8F9FB] px-3 py-8 sm:px-4 sm:py-12">
      <div className="flex flex-col items-center mb-5 sm:mb-6">
        <div className="w-12 h-12 bg-[#004DD2] rounded-xl flex items-center justify-center shadow-md mb-4">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#141B2B]">Faculty Information</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Complete your profile to join our academic network.</p>
      </div>

      <div className="mx-auto w-full max-w-[760px]">
        <div className="mb-4 flex flex-col gap-2 text-xs font-semibold text-[#004DD2] sm:flex-row sm:items-center sm:justify-between">
          <span>{step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}</span>
          <span>{step === 1 ? 'Personal Details' : 'Academic & Banking Details'}</span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-[#D9E3FF]">
          <div className="h-full rounded-full bg-[#004DD2] transition-all" style={{ width: progressWidth }} />
        </div>

        <form onSubmit={step === 1 ? handleNext : handleSubmit} className="mt-5 rounded-2xl border border-[#C3C5D8] bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl font-bold text-[#141B2B] sm:text-[22px]">Finalize Registration</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              {step === 1
                ? 'Please provide your basic profile details to begin the verification process.'
                : 'Please provide your academic, banking, and account security details to complete your application.'}
            </p>
          </div>

          {submitError && (
            <div className="mb-6 rounded-xl border border-[#F7C4C4] bg-[#FFF1F1] px-4 py-3 text-sm font-medium leading-relaxed text-[#EF4444]">
              {submitError}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#424656]">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  placeholder="Dr. Jane Smith"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[#C3C5D8] px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20"
                  required
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#424656]">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    placeholder="9876543210"
                    value={formData.phone_number}
                    onChange={handleChange}
                    maxLength={10}
                    className="w-full rounded-lg border border-[#C3C5D8] px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#424656]">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="jane.smith@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#C3C5D8] px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#424656]">Address</label>
                <textarea
                  name="address"
                  placeholder="123 Academic Way, Science District, Knowledge City"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-[#C3C5D8] px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <section>
                <div className="mb-4 flex items-center justify-between border-b border-[#DDE3F0] pb-2">
                  <h3 className="text-sm font-bold text-[#004DD2]">Academic & Identification</h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#424656]">Qualification / Specialization</label>
                    <select
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-[#C3C5D8] px-4 py-2.5 text-[#141B2B] focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20"
                      required
                    >
                      <option value="">Select highest qualification</option>
                      <optgroup label="Doctoral Degrees">
                        <option value="Ph.D. (Computer Science)">Ph.D. (Computer Science)</option>
                        <option value="Ph.D. (Management)">Ph.D. (Management)</option>
                        <option value="Ph.D. (Information Technology)">Ph.D. (Information Technology)</option>
                        <option value="Ph.D. (Other)">Ph.D. (Other Fields)</option>
                      </optgroup>
                      <optgroup label="Master's Degrees">
                        <option value="M.Tech (Computer Science/IT)">M.Tech (CS / IT)</option>
                        <option value="MCA (Master of Computer Applications)">MCA</option>
                        <option value="MBA (Master of Business Administration)">MBA</option>
                        <option value="M.Sc. (Computer Science/Electronics)">M.Sc. (CS / Electronics)</option>
                        <option value="M.A. / M.Com / Other Masters">Other Master's Degree</option>
                      </optgroup>
                      <optgroup label="Bachelor's / Graduation Degrees">
                        <option value="B.Tech / B.E. (Computer Science/IT)">B.Tech / B.E. (CS / IT)</option>
                        <option value="BCA (Bachelor of Computer Applications)">BCA</option>
                        <option value="BBA (Bachelor of Business Administration)">BBA</option>
                        <option value="B.Sc. (Computer Science/IT/Electronics)">B.Sc. (CS / IT / Electronics)</option>
                        <option value="B.A. / B.Com / Other Bachelor's">Other Bachelor's Degree</option>
                      </optgroup>
                      <optgroup label="Professional Certifications / Clearance">
                        <option value="UGC NET Qualified">UGC NET Qualified</option>
                        <option value="CSIR NET Qualified">CSIR NET Qualified</option>
                        <option value="GATE Qualified">GATE Qualified</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#424656]">Aadhaar No</label>
                    <input
                      type="text"
                      name="aadhaar_no"
                      placeholder="12-digit UIDAI number"
                      value={formData.aadhaar_no}
                      onChange={handleChange}
                      maxLength={12}
                      className="w-full rounded-lg border border-[#C3C5D8] px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#424656]">PAN Card Number</label>
                    <input
                      type="text"
                      name="pan_card_no"
                      placeholder="10-digit alphanumeric"
                      value={formData.pan_card_no}
                      onChange={handleChange}
                      maxLength={10}
                      className="w-full rounded-lg border border-[#C3C5D8] px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20"
                      required
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between border-b border-[#DDE3F0] pb-2">
                  <h3 className="text-sm font-bold text-[#004DD2]">Banking Details</h3>
                  <span className="text-[11px] font-medium text-[#6B7280]">State Bank of India (SBI) is preferred</span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#424656]">Bank Name</label>
                    <input
                      type="text"
                      name="bank_name"
                      placeholder="e.g. State Bank of India"
                      value={formData.bank_name}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-[#C3C5D8] px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#424656]">Account No</label>
                    <input
                      type="text"
                      name="account_no"
                      placeholder="Bank account number"
                      value={formData.account_no}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-[#C3C5D8] px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#424656]">IFSC Code</label>
                    <input
                      type="text"
                      name="ifsc_code"
                      placeholder="11-digit IFSC code"
                      value={formData.ifsc_code}
                      onChange={handleChange}
                      maxLength={11}
                      className="w-full rounded-lg border border-[#C3C5D8] px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20"
                      required
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between border-b border-[#DDE3F0] pb-2">
                  <h3 className="text-sm font-bold text-[#004DD2]">Account Security</h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#424656]">Password (Minimum length: 8 alpha numeric)</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[#C3C5D8] py-2.5 pl-4 pr-12 text-[#141B2B] placeholder-[#9CA3AF] focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#9CA3AF] hover:text-[#004DD2] transition-colors focus:outline-none"
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" y1="2" x2="22" y2="22" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#424656]">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Repeat your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[#C3C5D8] py-2.5 pl-4 pr-12 text-[#141B2B] placeholder-[#9CA3AF] focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#9CA3AF] hover:text-[#004DD2] transition-colors focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <svg className="h-5 w-5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" y1="2" x2="22" y2="22" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#DDE3F0] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => (step === 2 ? setStep(1) : onNavigate('faculty-login'))}
              className="text-sm font-semibold text-[#004DD2] hover:underline"
            >
              {step === 2 ? 'Back' : 'Back to Sign In'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#004DD2] px-6 py-3 text-sm font-medium text-white shadow-md transition hover:bg-[#003bb3] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {isSubmitting ? 'Submitting...' : step === 1 ? 'Continue to Final Step' : 'Submit Registration'}
              {!isSubmitting && (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </div>
        </form>

        <div className="mt-5 rounded-xl border border-[#E1E7F7] bg-[#EEF3FF] px-4 py-4 text-sm text-[#424656]">
          <div className="font-semibold text-[#004DD2]">{step === 1 ? 'Identity Verification' : 'Secure Submission'}</div>
          <p className="mt-1 text-xs leading-5 text-[#6B7280]">
            {step === 1
              ? 'Ensure your information matches your official identification documents for seamless background verification.'
              : 'All personal and banking data is encrypted and used solely for university administration and payroll purposes according to the Privacy Policy.'}
          </p>
        </div>
      </div>
    </div>
  );
}