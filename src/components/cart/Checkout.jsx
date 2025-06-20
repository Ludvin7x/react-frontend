import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  NumberSquareEight,
  CurrencyDollar,
  CreditCard,
  WarningCircle,
} from 'phosphor-react';
import { useCart } from '../../contexts/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, '');

export default function Checkout() {
  const { cart } = useCart();
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (Array.isArray(cart) && cart.length > 0) {
      const totalAmount = cart.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0
      );
      setTotal(totalAmount);
    } else {
      setTotal(0);
    }
  }, [cart]);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('You are not authenticated.');

      const response = await fetch(`${API_URL}/api/checkout/create-session/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create checkout session.');
      }

      const { id } = await response.json();
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      if (!stripe) throw new Error('Failed to initialize Stripe.');

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: id });
      if (stripeError) throw new Error(stripeError.message);
    } catch (err) {
      setError(err.message || 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <motion.div
        className="container mx-auto mt-12 max-w-xl px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="flex items-center justify-center gap-3 bg-yellow-100 text-yellow-800 rounded-lg p-4 text-lg font-medium"
          role="alert"
        >
          <WarningCircle size={28} weight="bold" />
          Your cart is currently empty.
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container mx-auto mt-12 max-w-3xl px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.h2
        className="flex items-center justify-center gap-3 text-3xl font-extrabold mb-8 text-gray-900 dark:text-gray-100"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <ShoppingCart size={32} weight="bold" />
        Order Summary
      </motion.h2>

      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-3 bg-red-100 text-red-700 rounded-lg p-4 mb-6 font-semibold"
            role="alert"
          >
            <WarningCircle size={28} weight="bold" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="overflow-x-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Product
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-center gap-1">
                  <NumberSquareEight size={18} weight="bold" />
                  Quantity
                </div>
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-end gap-1">
                  <CurrencyDollar size={18} weight="bold" />
                  Unit Price
                </div>
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-end gap-1">
                  <CurrencyDollar size={18} weight="bold" />
                  Subtotal
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {cart.map((item) => (
              <motion.tr
                key={item.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                  {item.menuitem?.title || 'Product'}
                </td>
                <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                  ${Number(item.unit_price).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                  ${(item.unit_price * item.quantity).toFixed(2)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <motion.div
        className="mt-8 border-t border-gray-300 dark:border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          <CurrencyDollar size={28} weight="bold" />
          Total: ${total.toFixed(2)}
        </div>

        <motion.button
          onClick={handleCheckout}
          disabled={loading}
          aria-busy={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-500 text-white font-semibold rounded-lg px-6 py-3 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              Processing...
              <svg
                className="animate-spin h-5 w-5 ml-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            </>
          ) : (
            <>
              <CreditCard size={24} weight="bold" />
              Pay with Card
            </>
          )}
        </motion.button>
      </motion.div>

      <motion.div
        className="mt-4 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <img
          src="/img/pagoseguro-stripe.png"
          alt="Secure payment via Stripe"
          className="max-w-[180px] select-none"
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );
}