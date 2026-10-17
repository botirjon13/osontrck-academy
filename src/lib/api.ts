export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://api.osontrack.uz"
).replace(/\/+$/, "");

export type UserRole = "ADMIN" | "MODERATOR" | "STUDENT";
export type ChallengeDifficulty = "EASY" | "MEDIUM" | "HARD";
export type CourseStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED";
export type TicketCategory =
  | "INSTRUCTOR_APPLICATION"
  | "TECHNICAL_ISSUE"
  | "COURSE_QUESTION"
  | "SUGGESTION"
  | "FEEDBACK"
  | "OTHER";
export type TicketStatus =
  | "OPEN"
  | "IN_REVIEW"
  | "NEEDS_INFORMATION"
  | "CLOSED"
  | "APPROVED"
  | "REJECTED";

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  isFree: boolean;
  priceCents: number | null;
  status: CourseStatus;
}

export interface CourseEnrollment {
  enrolledAt: string;
  course: Course;
}

export interface SupportTicketMessage {
  id: string;
  body: string;
  createdAt: string;
  sender: {
    id: string;
    fullName: string | null;
    email: string;
    role: UserRole;
  };
}

export interface SupportTicket {
  id: string;
  category: TicketCategory;
  status: TicketStatus;
  subject: string;
  instructorSpecialty: string | null;
  instructorExperience: string | null;
  instructorPortfolio: string | null;
  instructorCourseIdea: string | null;
  createdAt: string;
  updatedAt: string;
  requester: {
    id: string;
    fullName: string | null;
    email: string;
    role: UserRole;
  };
  messages: SupportTicketMessage[];
}

export interface CreateSupportTicketInput {
  category: TicketCategory;
  subject: string;
  message: string;
  instructorSpecialty?: string;
  instructorExperience?: string;
  instructorPortfolio?: string;
  instructorCourseIdea?: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  xp: number;
  mission1: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChallengeInput {
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  category: string;
}

export interface AdminOverview {
  stats: {
    totalUsers: number;
    admins: number;
    moderators: number;
    students: number;
    mission1Completed: number;
    totalXp: number;
  };
  recentStudents: Array<{
    id: string;
    email: string;
    fullName: string | null;
    role: UserRole;
    xp: number;
    mission1: boolean;
    createdAt: string;
  }>;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  token?: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...options.headers,
    },
  });

  const responseText = await response.text();
  let body: unknown;
  if (responseText) {
    try {
      body = JSON.parse(responseText);
    } catch {
      body = responseText;
    }
  }

  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? body.message
        : undefined;
    throw new ApiError(
      typeof message === "string"
        ? message
        : Array.isArray(message)
          ? message.join(", ")
          : `API so‘rovi bajarilmadi (${response.status}).`,
      response.status
    );
  }

  return body as T;
}

export function fetchPublishedCourses(): Promise<Course[]> {
  return request<Course[]>("/courses");
}

export function fetchMyCourses(token: string): Promise<CourseEnrollment[]> {
  return request<CourseEnrollment[]>("/courses/mine", token);
}

export function updateCurrentUser(
  token: string,
  fullName: string
): Promise<CurrentUser> {
  return request<CurrentUser>("/users/me", token, {
    method: "PATCH",
    body: JSON.stringify({ fullName }),
  });
}

export function fetchSupportTickets(token: string): Promise<SupportTicket[]> {
  return request<SupportTicket[]>("/support/tickets", token);
}

export function createSupportTicket(
  token: string,
  input: CreateSupportTicketInput
): Promise<SupportTicket> {
  return request<SupportTicket>("/support/tickets", token, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function addSupportTicketMessage(
  token: string,
  ticketId: string,
  body: string
): Promise<SupportTicket> {
  return request<SupportTicket>(
    `/support/tickets/${encodeURIComponent(ticketId)}/messages`,
    token,
    { method: "POST", body: JSON.stringify({ body }) }
  );
}

export function updateSupportTicketStatus(
  token: string,
  ticketId: string,
  status: TicketStatus
): Promise<SupportTicket> {
  return request<SupportTicket>(
    `/support/tickets/${encodeURIComponent(ticketId)}/status`,
    token,
    { method: "PATCH", body: JSON.stringify({ status }) }
  );
}

export function enrollInCourse(
  token: string,
  slug: string
): Promise<CourseEnrollment> {
  return request<CourseEnrollment>(
    `/courses/${encodeURIComponent(slug)}/enroll`,
    token,
    { method: "POST" }
  );
}

export async function fetchChallenges(token: string): Promise<Challenge[]> {
  const result = await request<{ data: Challenge[] }>(
    "/challenges?page=1&limit=50&sort=desc",
    token
  );
  return result.data;
}

export function createChallenge(
  token: string,
  challenge: ChallengeInput
): Promise<Challenge> {
  return request<Challenge>("/challenges", token, {
    method: "POST",
    body: JSON.stringify(challenge),
  });
}

export function updateChallenge(
  token: string,
  id: string,
  challenge: ChallengeInput
): Promise<Challenge> {
  return request<Challenge>(`/challenges/${encodeURIComponent(id)}`, token, {
    method: "PATCH",
    body: JSON.stringify(challenge),
  });
}

export function archiveChallenge(token: string, id: string): Promise<unknown> {
  return request<unknown>(`/challenges/${encodeURIComponent(id)}`, token, {
    method: "DELETE",
  });
}

export function fetchAdminOverview(token: string): Promise<AdminOverview> {
  return request<AdminOverview>("/users/admin/overview", token);
}

function isCurrentUser(value: unknown): value is CurrentUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "email" in value &&
    typeof value.email === "string" &&
    "fullName" in value &&
    (typeof value.fullName === "string" || value.fullName === null) &&
    "role" in value &&
    (value.role === "ADMIN" ||
      value.role === "MODERATOR" ||
      value.role === "STUDENT") &&
    "xp" in value &&
    typeof value.xp === "number" &&
    "mission1" in value &&
    typeof value.mission1 === "boolean"
  );
}

export async function fetchCurrentUser(token: string): Promise<CurrentUser> {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (!response.ok) {
    throw new ApiError("Profilni tekshirish amalga oshmadi.", response.status);
  }

  const user: unknown = await response.json();
  if (!isCurrentUser(user)) {
    throw new Error("API profil ma’lumotlari kutilgan formatda emas.");
  }

  return user;
}
