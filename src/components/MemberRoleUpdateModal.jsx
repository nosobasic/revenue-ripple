import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTimes, 
} from 'react-icons/fa';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';

const MemberRoleUpdateModal = ({setIsModalOpen}) => {
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalEmailError, setPaypalEmailError] = useState('');
  const [loading , setLoading ] = useState(false)
  const navigate = useNavigate();
  const { user } = useAuth();
 
  const handleClose = async () => {
    setIsModalOpen(false);
  };

  const handleJoinAffiliate = async () => {
    if (!paypalEmail.trim()) {
      setPaypalEmailError("PayPal email is required.");
      return;
    }
  
    setPaypalEmailError('');
    setLoading(true);
  
    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          role: "affiliate",
          paypal_email: paypalEmail.trim(), // ✅ update PayPal email
        })
        .eq("id", user.id)
        .select();
  
      if (error) {
        console.error("Supabase update error:", error);
        setLoading(false);
        return;
      }
  
      console.log("User role & PayPal updated:", data);
  
      setIsModalOpen(false); // ✅ close modal
      navigate("/thank-you-member-to-affiliate");
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000] animate-fadeIn p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] relative shadow-2xl animate-slideUp overflow-y-auto">
       <div className=' border-b border-gray-400 pb-4 flex items-center justify-between'>
            <h1 className='text-xl font-semibold'>Join Our Affiliate Program</h1>

            {/* Close Button */}
            <button
            onClick={handleClose}
            className=" w-12 h-12 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
            aria-label="Close"
            >
            
            <FaTimes className="text-xl" />
            </button>
            </div >
            <div className='mt-6'>
                <div className="form-group">
                <label htmlFor="paypal">PayPal Email</label>
                <input
                  type="email"
                  id="paypal"
                  name="paypal"
                  placeholder='Please enter your paypal email'
                  className="form-input"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  required
                />
                {paypalEmailError &&
                <p className='text-red-600'>Paypal email is required.</p>
                }
              </div>
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
            type="button"
            onClick={handleJoinAffiliate}
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Join...' : 'Start Earning as an Affiliate'}
          </button>
              </div>
            </div>
      </div>

      <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to { 
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MemberRoleUpdateModal;
