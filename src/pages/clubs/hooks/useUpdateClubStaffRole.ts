import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/api/queryKeys";

export type EditableClubStaffRole = "admin" | "organiser";

interface UpdateClubStaffRoleInput {
  clubId: string;
  staffId: string;
  role: EditableClubStaffRole;
}

interface UpdateClubStaffRoleResponse {
  message: string;
  staff: {
    id: string;
    email: string;
    name: string | null;
    alias: string | null;
    role: EditableClubStaffRole;
    roleLabel: string;
  };
}

async function updateClubStaffRole({
  clubId,
  staffId,
  role,
}: UpdateClubStaffRoleInput): Promise<UpdateClubStaffRoleResponse> {
  const res = await api.patch<UpdateClubStaffRoleResponse>(
    `/api/clubs/${clubId}/staff/${staffId}`,
    { role }
  );

  return res.data;
}

export function useUpdateClubStaffRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClubStaffRole,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.club.staff(variables.clubId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.adminClubs(),
      });
    },
  });
}
