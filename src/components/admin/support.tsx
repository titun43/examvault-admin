'use client';

// =============================================================================
// ExamVault Admin — Support Tickets
// Two-pane layout: list of all user-created support tickets (open first) +
// chat view for the selected ticket. Admin can reply and mark resolved.
//
// Reads/writes the same Firestore collections as the user-side Help &
// Support screen (lib/screens/support/help_support_screen.dart in the
// Flutter app). Real-time onSnapshot on both sides means messages flow
// end-to-end instantly.
// =============================================================================

import { useEffect, useState, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Send,
  CheckCircle2,
  RotateCcw,
  Headphones,
  MessagesSquare,
  Loader2,
} from 'lucide-react';

// ---- Types (mirror Flutter models) ----
type TicketStatus = 'open' | 'resolved';
interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string | null;
  userPhone?: string | null;
  subject: string;
  lastMessage: string;
  lastSender: string;
  status: TicketStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}
interface Message {
  id: string;
  sender: 'user' | 'admin' | 'system';
  text: string;
  createdAt: Timestamp | null;
}

function tsToDate(ts: Timestamp | null | undefined): Date | null {
  if (!ts) return null;
  try {
    if (typeof (ts as any).toDate === 'function') return (ts as any).toDate();
    if (ts instanceof Date) return ts;
    if (typeof ts === 'string') return new Date(ts);
  } catch {
    /* ignore */
  }
  return null;
}

function timeAgo(d: Date | null): string {
  if (!d) return '';
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function hhmm(d: Date | null): string {
  if (!d) return '';
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open');

  // Subscribe to all tickets, ordered by updatedAt desc.
  useEffect(() => {
    const q = query(
      collection(db, 'support_tickets'),
      orderBy('updatedAt', 'desc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Ticket[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            userId: data.userId ?? '',
            userName: data.userName ?? 'User',
            userEmail: data.userEmail ?? null,
            userPhone: data.userPhone ?? null,
            subject: data.subject ?? '',
            lastMessage: data.lastMessage ?? '',
            lastSender: data.lastSender ?? 'user',
            status: data.status === 'resolved' ? 'resolved' : 'open',
            createdAt: data.createdAt ?? null,
            updatedAt: data.updatedAt ?? null,
          };
        });
        setTickets(list);
        setLoading(false);
      },
      (err) => {
        console.error('support tickets snapshot error', err);
        toast.error('Could not load support tickets.');
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const filtered = tickets.filter((t) =>
    filter === 'all' ? true : t.status === filter
  );

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const resolvedCount = tickets.filter(
    (t) => t.status === 'resolved'
  ).length;

  const selected =
    tickets.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Headphones className="w-6 h-6 text-emerald-400" />
            Support Tickets
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Reply to user queries in real-time. Messages sync to the user app instantly.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="bg-orange-500/10 text-orange-300 border-orange-500/30"
          >
            {openCount} Open
          </Badge>
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-300 border-green-500/30"
          >
            {resolvedCount} Resolved
          </Badge>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['open', 'all', 'resolved'] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }
          >
            {f === 'open' ? 'Open' : f === 'resolved' ? 'Resolved' : 'All'}
          </Button>
        ))}
      </div>

      {/* Two-pane layout: list + chat */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 min-h-[600px]">
        {/* Ticket list */}
        <Card className="bg-slate-900 border-slate-800 max-h-[70vh] lg:max-h-[75vh] overflow-hidden">
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <MessagesSquare className="w-4 h-4" />
                Conversations
              </h3>
            </div>
            <div className="overflow-y-auto max-h-[60vh] lg:max-h-[68vh] custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-slate-500">
                  No {filter !== 'all' ? filter : ''} tickets.
                </div>
              ) : (
                filtered.map((t) => {
                  const active = t.id === selectedId;
                  const d = tsToDate(t.updatedAt);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${
                        active ? 'bg-slate-800' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-100 truncate">
                            {t.subject || '(no subject)'}
                          </p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {t.userName}
                            {t.userEmail ? ` · ${t.userEmail}` : ''}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-1">
                            <span className="text-slate-400">
                              {t.lastSender === 'admin'
                                ? 'You: '
                                : t.lastSender === 'system'
                                  ? ''
                                  : 'User: '}
                            </span>
                            {t.lastMessage || 'No messages'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                              t.status === 'open'
                                ? 'bg-orange-500/15 text-orange-300'
                                : 'bg-green-500/15 text-green-300'
                            }`}
                          >
                            {t.status === 'open' ? 'OPEN' : 'RESOLVED'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {timeAgo(d)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat panel */}
        <Card className="bg-slate-900 border-slate-800 max-h-[70vh] lg:max-h-[75vh] overflow-hidden">
          <CardContent className="p-0 h-full flex flex-col">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <Headphones className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Select a conversation to view messages</p>
                </div>
              </div>
            ) : (
              <ChatPanel ticket={selected} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// =============================================================================
// ChatPanel — messages + compose row + status actions for the selected ticket
// =============================================================================

function ChatPanel({ ticket }: { ticket: Ticket }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [toggling, setToggling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Subscribe to messages of the selected ticket.
  useEffect(() => {
    setMessages([]);
    const q = query(
      collection(db, 'support_tickets', ticket.id, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Message[] = snap.docs.map((d) => {
          const data = d.data() as any;
          const sender: Message['sender'] =
            data.sender === 'admin'
              ? 'admin'
              : data.sender === 'system'
                ? 'system'
                : 'user';
          return {
            id: d.id,
            sender,
            text: data.text ?? '',
            createdAt: data.createdAt ?? null,
          };
        });
        setMessages(list);
      },
      (err) => {
        console.error('messages snapshot error', err);
        toast.error('Could not load messages.');
      }
    );
    return () => unsub();
  }, [ticket.id]);

  // Auto-scroll to bottom when messages change.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setSending(true);
    try {
      const ticketRef = doc(db, 'support_tickets', ticket.id);
      await addDoc(
        collection(db, 'support_tickets', ticket.id, 'messages'),
        {
          sender: 'admin',
          text: t,
          createdAt: serverTimestamp(),
        }
      );
      await updateDoc(ticketRef, {
        lastMessage: t,
        lastSender: 'admin',
        status: 'open',
        updatedAt: serverTimestamp(),
      });
      setText('');
    } catch (e) {
      console.error(e);
      toast.error('Could not send reply.');
    } finally {
      setSending(false);
    }
  };

  const toggleResolved = async () => {
    setToggling(true);
    try {
      const next: TicketStatus =
        ticket.status === 'open' ? 'resolved' : 'open';
      // System message so the user can SEE the status change in their chat
      // (previously reopening from admin gave the user no visible signal).
      const systemText =
        next === 'resolved'
          ? '✓ Conversation marked as resolved by support'
          : '↻ Conversation reopened by support';
      await addDoc(
        collection(db, 'support_tickets', ticket.id, 'messages'),
        {
          sender: 'system',
          text: systemText,
          createdAt: serverTimestamp(),
        }
      );
      await updateDoc(doc(db, 'support_tickets', ticket.id), {
        status: next,
        lastMessage: systemText,
        lastSender: 'system',
        updatedAt: serverTimestamp(),
      });
      toast.success(
        next === 'resolved'
          ? 'Marked as resolved.'
          : 'Reopened conversation.'
      );
    } catch (e) {
      console.error(e);
      toast.error('Could not update status.');
    } finally {
      setToggling(false);
    }
  };

  const isResolved = ticket.status === 'resolved';

  return (
    <div className="flex flex-col h-full">
      {/* Ticket header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-100 truncate">
            {ticket.subject || '(no subject)'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {ticket.userName}
            {ticket.userEmail ? ` · ${ticket.userEmail}` : ''}
            {ticket.userPhone ? ` · ${ticket.userPhone}` : ''}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={toggleResolved}
          disabled={toggling}
          className={`shrink-0 ${
            isResolved
              ? 'border-orange-500/40 text-orange-300 hover:bg-orange-500/10'
              : 'border-green-500/40 text-green-300 hover:bg-green-500/10'
          }`}
        >
          {toggling ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isResolved ? (
            <RotateCcw className="w-3.5 h-3.5" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          <span className="ml-1.5">
            {isResolved ? 'Reopen' : 'Resolve'}
          </span>
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-slate-950/40"
      >
        {messages.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-10">
            No messages yet.
          </div>
        ) : (
          messages.map((m) => {
            const isSystem = m.sender === 'system';
            const isAdmin = m.sender === 'admin';
            const d = tsToDate(m.createdAt);
            // System events (resolve / reopen) render as a centered pill.
            if (isSystem) {
              return (
                <div key={m.id} className="flex justify-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 text-[11px] font-semibold text-center max-w-[90%]">
                    {m.text}
                  </span>
                </div>
              );
            }
            return (
              <div
                key={m.id}
                className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                    isAdmin
                      ? 'bg-emerald-600 text-white rounded-br-sm'
                      : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                  }`}
                >
                  {!isAdmin && (
                    <p className="text-[10px] font-bold text-slate-400 mb-1">
                      {ticket.userName}
                    </p>
                  )}
                  {isAdmin && (
                    <p className="text-[10px] font-bold text-emerald-200 mb-1">
                      Support Team
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {m.text}
                  </p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isAdmin ? 'text-emerald-200/70' : 'text-slate-500'
                    }`}
                  >
                    {hhmm(d)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Compose row */}
      <div className="border-t border-slate-800 p-3 flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={
            isResolved
              ? 'Reopened automatically when you reply…'
              : 'Type your reply…'
          }
          className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
        />
        <Button
          onClick={send}
          disabled={sending || !text.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
