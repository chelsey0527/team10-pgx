import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      navigate("/chatbot");
    } else {
      alert("Please enter a valid 6-digit code.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen min-w-[375px] bg-gradient-to-br from-[#e9e9e9] to-[#ffffff] p-4">
      <div className="flex flex-col justify-center flex-grow md:items-center">
        <div className="md:w-[600px] w-full">
          {/* Logo */}
          <div className="mb-8 self-start">
            <img src="/copilot-logo.png" alt="Copilot Logo" className="w-16 h-16" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-['ABC_Ginto'] mb-2 text-left">
            Hi, I'm Copilot, your <br/> AI companion.
          </h1>

          {/* Code Input Section */}
          <div className="w-full max-w-md mt-20">
            <h2 className="text-gray-500 text-xl font-['ABC_Ginto'] mb-6 text-center">
              Enter One-time Code here
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
              <div className="flex justify-center gap-2 mb-8">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    className="w-10 h-12 text-center text-2xl font-medium border rounded-lg bg-[#D9D9D9]"
                    value={code[index] || ''}
                    onChange={(e) => {
                      const newCode = code.split('');
                      newCode[index] = e.target.value;
                      setCode(newCode.join(''));
                    }}
                  />
                ))}
              </div>
              
              <button
                type="submit"
                className="w-full max-w-xs py-3 rounded-full bg-[#D9D9D9] text-black mt-20"
              >
                Enter
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;