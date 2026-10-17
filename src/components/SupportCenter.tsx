import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LifeBuoy,
  Plus,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/auth-context";
import {
  addSupportTicketMessage,
  createSupportTicket,
  fetchSupportTickets,
  updateSupportTicketStatus,
} from "../lib/api";
import type {
  CreateSupportTicketInput,
  SupportTicket,
  TicketCategory,
  TicketStatus,
  UserRole,
} from "../lib/api";

const categories: TicketCategory[] = [
  "INSTRUCTOR_APPLICATION",
  "TECHNICAL_ISSUE",
  "COURSE_QUESTION",
  "SUGGESTION",
  "FEEDBACK",
  "OTHER",
];

const statuses: TicketStatus[] = [
  "OPEN",
  "IN_REVIEW",
  "NEEDS_INFORMATION",
  "CLOSED",
  "APPROVED",
  "REJECTED",
];

type ApplicationForm = {
  specialty: string;
  experience: string;
  portfolio: string;
  courseIdea: string;
};

const initialApplicationForm: ApplicationForm = {
  specialty: "",
  experience: "",
  portfolio: "",
  courseIdea: "",
};

export default function SupportCenter({ role }: { role: UserRole }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<TicketCategory>("TECHNICAL_ISSUE");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [application, setApplication] = useState<ApplicationForm>(initialApplicationForm);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusDraft, setStatusDraft] = useState<TicketStatus>("IN_REVIEW");

  const canReviewApplications = role === "ADMIN";
  const isStaff = role === "ADMIN" || role === "MODERATOR";

  const loadTickets = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError(t("account.sessionExpired"));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchSupportTickets(token);
      setTickets(result);
      setSelectedTicket((current) =>
        current ? result.find((ticket) => ticket.id === current.id) ?? null : null
      );
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : t("support.loadError")
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void Promise.resolve().then(loadTickets);
  }, [loadTickets]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError(t("account.sessionExpired"));
      return;
    }

    const input: CreateSupportTicketInput = {
      category,
      subject: subject.trim(),
      message: message.trim(),
    };
    if (category === "INSTRUCTOR_APPLICATION") {
      input.instructorSpecialty = application.specialty.trim();
      input.instructorExperience = application.experience.trim();
      input.instructorPortfolio = application.portfolio.trim() || undefined;
      input.instructorCourseIdea = application.courseIdea.trim();
    }

    setSaving(true);
    setError(null);
    try {
      const ticket = await createSupportTicket(token, input);
      setTickets((current) => [ticket, ...current]);
      setSelectedTicket(ticket);
      setShowForm(false);
      setSubject("");
      setMessage("");
      setApplication(initialApplicationForm);
      setCategory("TECHNICAL_ISSUE");
    } catch (createError: unknown) {
      setError(
        createError instanceof Error
          ? createError.message
          : t("support.createError")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !selectedTicket) {
      setError(t("account.sessionExpired"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await addSupportTicketMessage(
        token,
        selectedTicket.id,
        reply.trim()
      );
      setSelectedTicket(updated);
      setTickets((current) =>
        current.map((ticket) => (ticket.id === updated.id ? updated : ticket))
      );
      setReply("");
    } catch (replyError: unknown) {
      setError(
        replyError instanceof Error
          ? replyError.message
          : t("support.replyError")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async () => {
    const token = localStorage.getItem("token");
    if (!token || !selectedTicket) {
      setError(t("account.sessionExpired"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await updateSupportTicketStatus(
        token,
        selectedTicket.id,
        statusDraft
      );
      setSelectedTicket(updated);
      setTickets((current) =>
        current.map((ticket) => (ticket.id === updated.id ? updated : ticket))
      );
    } catch (statusError: unknown) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : t("support.statusError")
      );
    } finally {
      setSaving(false);
    }
  };

  const openTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setStatusDraft(
      ticket.status === "OPEN" ? "IN_REVIEW" : ticket.status
    );
    setShowForm(false);
    setError(null);
  };

  const staffMayReply =
    isStaff &&
    selectedTicket?.status !== "CLOSED" &&
    selectedTicket?.status !== "APPROVED" &&
    selectedTicket?.status !== "REJECTED";
  const applicantMayReply =
    !isStaff &&
    selectedTicket?.category === "INSTRUCTOR_APPLICATION" &&
    selectedTicket.status === "NEEDS_INFORMATION";
  const ticketMayReply =
    !!selectedTicket &&
    (selectedTicket.category === "INSTRUCTOR_APPLICATION"
      ? staffMayReply || applicantMayReply
      : selectedTicket.status !== "CLOSED" && (isStaff || role === "STUDENT"));

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-w-0">
        {selectedTicket ? (
          <TicketConversation
            ticket={selectedTicket}
            role={role}
            currentUserId={user?.id ?? ""}
            t={t}
            language={i18n.language}
            error={error}
            reply={reply}
            setReply={setReply}
            saving={saving}
            canReviewApplications={canReviewApplications}
            statusDraft={statusDraft}
            setStatusDraft={setStatusDraft}
            staffMayReply={Boolean(staffMayReply)}
            ticketMayReply={Boolean(ticketMayReply)}
            onBack={() => {
              setSelectedTicket(null);
              setError(null);
            }}
            onReply={(event) => void handleReply(event)}
            onStatusUpdate={() => void handleStatusUpdate()}
          />
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">
                  {isStaff ? t("support.inbox") : t("support.myTickets")}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {isStaff ? t("support.inboxHint") : t("support.ticketsHint")}
                </p>
              </div>
              {!isStaff && !showForm && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(true);
                    setError(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-yellow-300"
                >
                  <Plus size={17} aria-hidden="true" />
                  {t("support.newTicket")}
                </button>
              )}
            </div>

            {error && <ErrorMessage message={error} />}

            {showForm && !isStaff && (
              <form
                onSubmit={(event) => void handleCreate(event)}
                className="mb-6 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{t("support.newTicket")}</h3>
                    <p className="mt-1 text-sm text-slate-400">{t("support.formHint")}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-sm text-slate-400 hover:text-white"
                  >
                    {t("support.cancel")}
                  </button>
                </div>

                <Field label={t("support.category")}>
                  <select
                    required
                    value={category}
                    onChange={(event) => setCategory(event.target.value as TicketCategory)}
                    className={inputClass}
                  >
                    {categories.map((value) => (
                      <option key={value} value={value}>
                        {t(`support.category.${value}`)}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={t("support.subject")}>
                  <input
                    required
                    minLength={5}
                    maxLength={120}
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    className={inputClass}
                    placeholder={t("support.subjectPlaceholder")}
                  />
                </Field>

                {category === "INSTRUCTOR_APPLICATION" && (
                  <div className="space-y-4 rounded-xl border border-yellow-300/20 bg-yellow-300/[0.04] p-4">
                    <p className="text-sm font-medium text-yellow-100">
                      {t("support.applicationFieldsHint")}
                    </p>
                    <Field label={t("support.specialty")}>
                      <input
                        required
                        minLength={2}
                        maxLength={160}
                        value={application.specialty}
                        onChange={(event) =>
                          setApplication({ ...application, specialty: event.target.value })
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label={t("support.experience")}>
                      <textarea
                        required
                        minLength={10}
                        maxLength={5000}
                        rows={3}
                        value={application.experience}
                        onChange={(event) =>
                          setApplication({ ...application, experience: event.target.value })
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label={t("support.courseIdea")}>
                      <textarea
                        required
                        minLength={10}
                        maxLength={5000}
                        rows={3}
                        value={application.courseIdea}
                        onChange={(event) =>
                          setApplication({ ...application, courseIdea: event.target.value })
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label={t("support.portfolio")}>
                      <input
                        type="url"
                        value={application.portfolio}
                        onChange={(event) =>
                          setApplication({ ...application, portfolio: event.target.value })
                        }
                        className={inputClass}
                        placeholder="https://"
                      />
                    </Field>
                    <p className="text-xs leading-5 text-slate-400">
                      {t("support.applicationPrivacy")}
                    </p>
                  </div>
                )}

                <Field label={t("support.message")}>
                  <textarea
                    required
                    minLength={10}
                    maxLength={10000}
                    rows={5}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className={inputClass}
                    placeholder={t("support.messagePlaceholder")}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-yellow-300 disabled:opacity-50"
                >
                  <Send size={16} aria-hidden="true" />
                  {saving ? t("support.sending") : t("support.submit")}
                </button>
              </form>
            )}

            {loading ? (
              <p className="rounded-2xl border border-white/10 p-6 text-slate-300" role="status">
                {t("support.loading")}
              </p>
            ) : tickets.length === 0 && !showForm ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-center">
                <LifeBuoy className="mx-auto text-yellow-300" size={28} aria-hidden="true" />
                <p className="mt-4 font-semibold">
                  {isStaff ? t("support.noInboxTickets") : t("support.noTickets")}
                </p>
                {!isStaff && (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="mt-4 text-sm text-yellow-200 underline underline-offset-4"
                  >
                    {t("support.newTicket")}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => openTicket(ticket)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-yellow-300/30 hover:bg-white/[0.05]"
                  >
                    <span className="flex flex-wrap items-center justify-between gap-3">
                      <span className="font-semibold">{ticket.subject}</span>
                      <TicketStatusBadge status={ticket.status} t={t} />
                    </span>
                    <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                      <span>{t(`support.category.${ticket.category}`)}</span>
                      {isStaff && (
                        <span>
                          {ticket.requester.fullName || ticket.requester.email}
                        </span>
                      )}
                      <span>
                        {new Intl.DateTimeFormat(i18n.language, {
                          dateStyle: "medium",
                        }).format(new Date(ticket.updatedAt))}
                      </span>
                      <span>
                        {t("support.messageCount", { count: ticket.messages.length })}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-yellow-300/10 text-yellow-200">
            <ShieldCheck size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-semibold">{t("support.roadmapTitle")}</h3>
            <p className="mt-1 text-xs text-slate-400">{t("support.roadmapHint")}</p>
          </div>
        </div>
        <ol className="mt-5 space-y-4">
          {[
            "support.roadmap.apply",
            "support.roadmap.review",
            "support.roadmap.selection",
            "support.roadmap.course",
            "support.roadmap.publish",
          ].map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full border border-yellow-300/20 bg-yellow-300/10 text-xs font-semibold text-yellow-200">
                {index + 1}
              </span>
              <p className="pt-0.5 text-sm leading-5 text-slate-300">{t(step)}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-slate-400">
          {t("support.roadmapNote")}
        </p>
        <a
          href="mailto:support@osontrack.uz"
          className="mt-4 inline-flex items-center gap-1 text-xs text-yellow-200 hover:text-yellow-100"
        >
          {t("support.contactFallback")}
          <ExternalLink size={13} aria-hidden="true" />
        </a>
      </aside>
    </div>
  );
}

function TicketConversation({
  ticket,
  role,
  currentUserId,
  t,
  language,
  error,
  reply,
  setReply,
  saving,
  canReviewApplications,
  statusDraft,
  setStatusDraft,
  staffMayReply,
  ticketMayReply,
  onBack,
  onReply,
  onStatusUpdate,
}: {
  ticket: SupportTicket;
  role: UserRole;
  currentUserId: string;
  t: (key: string, options?: Record<string, unknown>) => string;
  language: string;
  error: string | null;
  reply: string;
  setReply: (value: string) => void;
  saving: boolean;
  canReviewApplications: boolean;
  statusDraft: TicketStatus;
  setStatusDraft: (status: TicketStatus) => void;
  staffMayReply: boolean;
  ticketMayReply: boolean;
  onBack: () => void;
  onReply: (event: React.FormEvent<HTMLFormElement>) => void;
  onStatusUpdate: () => void;
}) {
  const applicantDetails =
    ticket.category === "INSTRUCTOR_APPLICATION"
      ? [
          ["support.specialty", ticket.instructorSpecialty],
          ["support.experience", ticket.instructorExperience],
          ["support.courseIdea", ticket.instructorCourseIdea],
        ].filter((item): item is [string, string] => Boolean(item[1]))
      : [];

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm text-yellow-200 hover:text-yellow-100"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t("support.backToTickets")}
      </button>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
          <div>
            <p className="text-xs text-yellow-200">{t(`support.category.${ticket.category}`)}</p>
            <h2 className="mt-2 text-xl font-semibold">{ticket.subject}</h2>
            <p className="mt-2 text-xs text-slate-400">
              {t("support.from")} {ticket.requester.fullName || ticket.requester.email}
            </p>
          </div>
          <TicketStatusBadge status={ticket.status} t={t} />
        </header>

        {applicantDetails.length > 0 && (
          <div className="space-y-3 border-b border-white/10 p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-yellow-100">
              {t("support.applicationDetails")}
            </h3>
            {applicantDetails.map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-slate-400">{t(label)}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-200">{value}</p>
              </div>
            ))}
            {ticket.instructorPortfolio && (
              <a
                href={ticket.instructorPortfolio}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-sky-200 underline"
              >
                {t("support.portfolio")}
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            )}
          </div>
        )}

        <div className="space-y-4 p-5 sm:p-6">
          {ticket.messages.map((item) => {
            const ownMessage = item.sender.id === currentUserId;
            return (
              <article
                key={item.id}
                className={`max-w-[92%] rounded-2xl border p-4 ${
                  ownMessage
                    ? "ml-auto border-yellow-300/20 bg-yellow-300/[0.07]"
                    : "border-white/10 bg-[#07111f]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span className="font-medium text-slate-200">
                    {item.sender.fullName || item.sender.email}
                  </span>
                  <time dateTime={item.createdAt}>
                    {new Intl.DateTimeFormat(language, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(item.createdAt))}
                  </time>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                  {item.body}
                </p>
              </article>
            );
          })}
        </div>

        {canReviewApplications &&
          ticket.category === "INSTRUCTOR_APPLICATION" &&
          ticket.status !== "APPROVED" &&
          ticket.status !== "REJECTED" && (
            <div className="border-t border-white/10 p-5 sm:p-6">
              <h3 className="text-sm font-semibold">{t("support.reviewApplication")}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                {t("support.reviewApplicationHint")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <select
                  value={statusDraft}
                  onChange={(event) => setStatusDraft(event.target.value as TicketStatus)}
                  className={inputClass + " w-auto min-w-52"}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {t(`support.status.${status}`)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={saving || statusDraft === ticket.status}
                  onClick={onStatusUpdate}
                  className="rounded-xl border border-yellow-300/30 px-4 py-2 text-sm text-yellow-100 hover:bg-yellow-300/10 disabled:opacity-40"
                >
                  {t("support.updateStatus")}
                </button>
              </div>
            </div>
          )}

        {error && <div className="px-5 sm:px-6"><ErrorMessage message={error} /></div>}

        {ticketMayReply ? (
          <form onSubmit={onReply} className="border-t border-white/10 p-5 sm:p-6">
            {ticket.category === "INSTRUCTOR_APPLICATION" &&
              role === "STUDENT" &&
              ticket.status === "NEEDS_INFORMATION" && (
                <p className="mb-3 text-sm text-amber-200">
                  {t("support.additionalInfoRequested")}
                </p>
              )}
            {staffMayReply &&
              ticket.category !== "INSTRUCTOR_APPLICATION" && (
                <p className="mb-3 text-xs text-slate-400">
                  {t("support.replyClosesTicket")}
                </p>
              )}
            <label htmlFor="ticket-reply" className="mb-2 block text-sm font-medium">
              {t("support.reply")}
            </label>
            <textarea
              id="ticket-reply"
              required
              minLength={2}
              maxLength={10000}
              rows={4}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={saving || reply.trim().length < 2}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-yellow-300 disabled:opacity-50"
            >
              <Send size={16} aria-hidden="true" />
              {saving ? t("support.sending") : t("support.sendReply")}
            </button>
          </form>
        ) : (
          <div className="border-t border-white/10 p-5 text-sm text-slate-400 sm:p-6">
            {ticket.status === "CLOSED"
              ? t("support.closedHint")
              : ticket.status === "APPROVED"
                ? t("support.approvedHint")
                : ticket.status === "REJECTED"
                  ? t("support.rejectedHint")
                  : ticket.category === "INSTRUCTOR_APPLICATION" &&
                      !canReviewApplications &&
                      role !== "ADMIN"
                    ? t("support.applicationPrivate")
                    : t("support.waitingForResponse")}
          </div>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300/60";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium text-slate-200">
      <span>{label}</span>
      {children}
    </label>
  );
}

function TicketStatusBadge({
  status,
  t,
}: {
  status: TicketStatus;
  t: (key: string) => string;
}) {
  const completed = ["CLOSED", "APPROVED", "REJECTED"].includes(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
        completed
          ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
          : "border-amber-300/20 bg-amber-300/10 text-amber-100"
      }`}
    >
      {completed ? (
        <CheckCircle2 size={13} aria-hidden="true" />
      ) : (
        <Clock3 size={13} aria-hidden="true" />
      )}
      {t(`support.status.${status}`)}
    </span>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="mb-4 rounded-xl border border-red-300/20 bg-red-300/5 p-3 text-sm text-red-200" role="alert">
      {message}
    </p>
  );
}
