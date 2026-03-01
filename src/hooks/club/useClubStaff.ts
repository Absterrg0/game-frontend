import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/api/queryKeys";

export type ClubStaffRole = "default_admin" | "admin" | "organiser";

export interface ClubStaffMember {
  id: string;
  email: string;
  name: string | null;
  alias: string | null;
  role: ClubStaffRole;
  roleLabel: string;
}

interface ClubStaffResponse {
  staff: ClubStaffMember[];
}

async function fetchClubStaff(clubId: string): Promise<ClubStaffResponse> {
  const res = await api.get<ClubStaffResponse>(`/api/clubs/${clubId}/staff`);
  return res.data;
}

export function useClubStaff(clubId: string | null) {
  return useQuery({
    queryKey: queryKeys.club.staff(clubId ?? ""),
    queryFn: () => fetchClubStaff(clubId!),
    enabled: !!clubId,
  });
}
