"use client";

import { useState } from "react";
import axios from "axios";
import { emitEvent } from "@/lib/socket";

interface InviteModalProps {
  isOpen: boolean;
  roomId: string;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteModal({
  isOpen,
  roomId,
  token,
  onClose,
  onSuccess,
}: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const response = await axios.post(
        `/api/rooms/${roomId}/invite`,
        { email: email.toLowerCase() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setSuccess(true);
        setEmail("");

        // Emit socket event to notify the invited user
        emitEvent("user-invited", {
          roomId,
          invitedUser: response.data.invitedUser,
          creator: {
            name: response.data.room.creatorName,
            email: response.data.room.creatorEmail,
          },
        });

        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/10">
        <h2 className="text-3xl font-bold text-white mb-2">Invite Player</h2>
        <p className="text-gray-400 mb-6">
          Send an invitation to another player via email
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="player@example.com"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              onKeyPress={(e) => e.key === "Enter" && handleInvite()}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-lg text-sm">
              ✓ Invitation sent successfully!
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                "Send Invite"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
