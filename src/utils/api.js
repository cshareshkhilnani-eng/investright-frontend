const API_BASE_URL = "https://investright-backend-rt6w.onrender.com";

export const assessRiskProfile = async (formData) => {
  const params = new URLSearchParams();
  params.append("age", formData.age);
  params.append("income_stability", formData.income_stability);
  params.append("emergency_fund", formData.emergency_fund);
  params.append("liabilities", formData.liabilities);
  params.append("crash_reaction", formData.crash_reaction);
  params.append("experience", formData.experience);
  params.append("checking_frequency", formData.checking_frequency);
  const response = await fetch(`${API_BASE_URL}/api/risk-profile/assess?${params}`, { method: "GET" });
  return response.json();
};